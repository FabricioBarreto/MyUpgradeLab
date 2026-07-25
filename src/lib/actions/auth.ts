'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const fullName = formData.get('fullName') as string

  if (password !== confirmPassword) {
    redirect(`/register?error=${encodeURIComponent('Las contrasenas no coinciden')}`)
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
    redirect(`/register?error=${encodeURIComponent(error.message)}`)
  }

  // Si el proyecto de Supabase tiene "Confirm email" desactivado, signUp ya
  // devuelve una sesion activa (la cookie la setea createClient() server-side)
  // y podemos mandar directo al dashboard. Si sigue activado, no hay sesion
  // todavia y hay que esperar a que confirme por mail.
  if (data.session) {
    redirect('/dashboard')
  }

  redirect(`/login?message=${encodeURIComponent('Revisa tu email para confirmar la cuenta')}`)
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
