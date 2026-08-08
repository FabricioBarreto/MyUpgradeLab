'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sanitizeCourseHtml } from '@/lib/sanitize'

export async function createCourse(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const price = parseFloat(formData.get('price') as string)
  const accessType = formData.get('accessType') as string
  const resourceUrl = formData.get('resourceUrl') as string
  const contentHtmlRaw = (formData.get('contentHtml') as string) ?? ''
  const contentHtml = contentHtmlRaw.trim() ? sanitizeCourseHtml(contentHtmlRaw) : null

  const { error } = await supabase.from('courses').insert({
    title,
    slug,
    description,
    category,
    price,
    access_type: accessType,
    resource_url: resourceUrl,
    content_html: contentHtml,
  })

  if (error) {
    redirect(`/admin/courses/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/courses')
  redirect('/admin/courses')
}

export async function updateCourse(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const price = parseFloat(formData.get('price') as string)
  const accessType = formData.get('accessType') as string
  const resourceUrl = formData.get('resourceUrl') as string
  const contentHtmlRaw = (formData.get('contentHtml') as string) ?? ''
  const contentHtml = contentHtmlRaw.trim() ? sanitizeCourseHtml(contentHtmlRaw) : null

  const { error } = await supabase
    .from('courses')
    .update({
      title,
      slug,
      description,
      category,
      price,
      access_type: accessType,
      resource_url: resourceUrl,
      content_html: contentHtml,
    })
    .eq('id', id)

  if (error) {
    redirect(`/admin/courses/${id}/edit?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/admin/courses')
  revalidatePath(`/dashboard/leer/${slug}`)
  redirect('/admin/courses')
}

export async function toggleCourseActive(formData: FormData) {
  const id = formData.get('id') as string
  const isActive = formData.get('isActive') === 'true'

  const supabase = await createClient()
  await supabase.from('courses').update({ is_active: !isActive }).eq('id', id)

  revalidatePath('/admin/courses')
}

export async function deleteCourse(formData: FormData) {
  const id = formData.get('id') as string

  const supabase = await createClient()
  const { error } = await supabase.from('courses').delete().eq('id', id)

  if (error) {
    redirect(`/admin/courses?error=${encodeURIComponent('No se pudo borrar: el curso tiene compras asociadas. Desactivalo en vez de borrarlo.')}`)
  }

  revalidatePath('/admin/courses')
  redirect('/admin/courses')
}
