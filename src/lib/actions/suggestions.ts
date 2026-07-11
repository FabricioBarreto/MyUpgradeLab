'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markSuggestionReviewed(formData: FormData) {
  const id = formData.get('id') as string

  const supabase = await createClient()
  await supabase.from('suggestions').update({ status: 'reviewed' }).eq('id', id)

  revalidatePath('/admin/suggestions')
}
