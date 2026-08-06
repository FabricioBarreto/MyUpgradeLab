'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { becomeAffiliate } from '@/lib/actions/affiliates'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Si la persona llego con un link de afiliado (?ref=CODE, guardado como
// cookie por el middleware), le asignamos ese afiliado en su profile. Usa el
// service role porque en el momento del signup puede que todavia no haya
// sesion (si "Confirm email" esta activado en el proyecto de Supabase) y la
// escritura via RLS del usuario no funcionaria.
async function attributeReferral(userId: string) {
  const cookieStore = await cookies()
  const ref = cookieStore.get('ul_ref')?.value
  if (!ref) return

  const service = createServiceClient()

  const { data: affiliate } = await service
    .from('affiliates')
    .select('id, user_id, status')
    .eq('code', ref)
    .maybeSingle()

  if (!affiliate || affiliate.status !== 'approved' || affiliate.user_id === userId) return

  await service
    .from('profiles')
    .update({ referred_by_affiliate_id: affiliate.id })
    .eq('id', userId)
    .is('referred_by_affiliate_id', null)
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const fullName = formData.get('fullName') as string
  // Si viene de /register?intent=affiliate (link desde la landing publica
  // /afiliados), damos de alta la cuenta como afiliado automaticamente y la
  // mandamos directo a su panel, en vez de al dashboard de estudiante.
  const intent = formData.get('intent') as string

  const registerRedirect = (params: Record<string, string>) => {
    const query = new URLSearchParams(params)
    if (intent === 'affiliate') query.set('intent', 'affiliate')
    redirect(`/register?${query.toString()}`)
  }

  if (password !== confirmPassword) {
    registerRedirect({ error: 'Las contraseñas no coinciden' })
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    registerRedirect({ error: error.message })
  }

  if (data.user) {
    await attributeReferral(data.user.id)
  }

  // Si el proyecto de Supabase tiene "Confirm email" desactivado, signUp ya
  // devuelve una sesion activa (la cookie la setea createClient() server-side)
  // y podemos mandar directo al dashboard. Si sigue activado, no hay sesion
  // todavia y hay que esperar a que confirme por mail.
  if (data.session) {
    if (intent === 'affiliate') {
      await becomeAffiliate()
      redirect('/dashboard/afiliados')
    }
    redirect('/dashboard')
  }

  redirect(`/login?message=${encodeURIComponent('Revisa tu email para confirmar la cuenta')}`)
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  // Permite mandar a un destino puntual despues de loguearse (ej: alguien
  // que entro por /afiliados y toco "Iniciar sesion" termina en su panel de
  // afiliado, no en el dashboard generico). Solo se acepta una ruta interna
  // (empieza con "/"), nunca una URL externa.
  const redirectTo = formData.get('redirect') as string
  const destination = redirectTo?.startsWith('/') ? redirectTo : '/dashboard'

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const query = new URLSearchParams({ error: error.message })
    if (redirectTo) query.set('redirect', redirectTo)
    redirect(`/login?${query.toString()}`)
  }

  redirect(destination)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
