'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Cualquiera puede sugerir (incluso sin cuenta) — la policy suggestions_insert_any
// del schema permite insert con check(true). Si hay sesion, guardamos el
// user_id para poder responderle o darle contexto despues.
export async function createSuggestion(formData: FormData) {
  const name = (formData.get('name') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null
  const message = (formData.get('message') as string)?.trim()

  if (!message) {
    redirect(`/sugerencias?error=${encodeURIComponent('Escribi tu sugerencia antes de enviar')}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('suggestions').insert({
    user_id: user?.id ?? null,
    name,
    email,
    message,
  })

  if (error) {
    redirect(`/sugerencias?error=${encodeURIComponent('No se pudo enviar, intenta de nuevo')}`)
  }

  redirect('/sugerencias?success=1')
}

export async function markSuggestionReviewed(formData: FormData) {
  const id = formData.get('id') as string

  const supabase = await createClient()
  await supabase.from('suggestions').update({ status: 'reviewed' }).eq('id', id)

  revalidatePath('/admin/suggestions')
}
