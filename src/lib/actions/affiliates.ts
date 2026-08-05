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
