'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin 0/O/1/I para que sea facil de leer/dictar

function randomCode(length = 6): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}

// Da de alta al usuario actual como afiliado (comision cash del 30%, fija
// por ahora — ver default de `commission_rate` en el schema). Se aprueba
// automaticamente: no hay revision manual en esta primera version, ya que el
// pago de comisiones es un proceso manual aparte y no hay riesgo de fraude
// en simplemente generar un codigo de referido.
export async function becomeAffiliate() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: existing } = await supabase
    .from('affiliates')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return

  // Reintenta unas pocas veces por si el codigo random choca con uno
  // existente (poco probable con 6 caracteres de un alfabeto de 32, pero el
  // codigo es unique en el schema).
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from('affiliates').insert({
      user_id: user.id,
      code: randomCode(),
      status: 'approved',
    })

    if (!error) break
    if (error.code !== '23505') break // no es un choque de unique, no reintentar
  }

  revalidatePath('/dashboard/afiliados')
}

// El propio afiliado carga o actualiza el alias/CBU al que le transferimos
// la comision acumulada el dia de pago (proceso manual, ver docs/TASKS.md).
export async function updatePayoutAlias(formData: FormData) {
  const payoutAlias = (formData.get('payoutAlias') as string)?.trim()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('affiliates')
    .update({ payout_alias: payoutAlias || null })
    .eq('user_id', user.id)

  revalidatePath('/dashboard/afiliados')
}

// Accion de admin: marca como pagadas todas las comisiones pendientes de un
// afiliado (pago mensual en lote, hecho a mano por transferencia). No hay
// integracion de pagos automatica aca — esto solo registra que ya se le
// transfirio, despues de que el admin hizo la transferencia real.
export async function markAffiliatePaid(formData: FormData) {
  const affiliateId = formData.get('affiliateId') as string
  if (!affiliateId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') return

  await supabase
    .from('affiliate_referrals')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('affiliate_id', affiliateId)
    .eq('status', 'pending')

  revalidatePath('/admin/afiliados')
}
