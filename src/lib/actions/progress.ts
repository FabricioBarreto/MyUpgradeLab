'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Marca un curso como completado para el usuario actual. Solo se permite si
// el usuario realmente tiene acceso al curso (compra aprobada o suscripcion
// activa) — mismo criterio que en el resto de la app.
export async function markCourseCompleted(formData: FormData) {
  const courseId = formData.get('courseId') as string
  if (!courseId) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const [{ data: purchase }, { data: subscription }] = await Promise.all([
    supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'approved')
      .maybeSingle(),
    supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const hasAccess = Boolean(purchase) || subscription?.status === 'active'
  if (!hasAccess) return

  await supabase
    .from('course_progress')
    .upsert(
      { user_id: user.id, course_id: courseId, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,course_id' }
    )

  revalidatePath('/dashboard')
}
