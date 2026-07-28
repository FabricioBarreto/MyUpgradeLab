'use server'

import { redirect } from 'next/navigation'
import { Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { getMercadoPagoConfig } from '@/lib/mercadopago'

// Crea una preferencia de Checkout Pro para la compra individual de un curso
// y redirige al usuario al checkout hosteado de Mercado Pago.
export async function createCheckoutPreference(formData: FormData) {
  const courseId = formData.get('courseId') as string
  const slug = formData.get('slug') as string

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?message=${encodeURIComponent('Inicia sesion para comprar este curso')}&redirect=/cursos/${slug}`)
  }

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('is_active', true)
    .single()

  if (!course) {
    redirect(`/cursos/${slug}?error=${encodeURIComponent('Curso no disponible')}`)
  }

  if (course.access_type === 'subscription_only') {
    redirect(`/cursos/${slug}?error=${encodeURIComponent('Este curso solo esta disponible por suscripcion')}`)
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .insert({
      user_id: user.id,
      course_id: course.id,
      amount: course.price,
      status: 'pending',
    })
    .select()
    .single()

  if (purchaseError || !purchase) {
    redirect(`/cursos/${slug}?error=${encodeURIComponent('No se pudo iniciar la compra, intenta de nuevo')}`)
    return
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  let initPoint: string | undefined

  try {
    const preferenceClient = new Preference(getMercadoPagoConfig('checkout'))
    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            id: course.id,
            title: course.title,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: Number(course.price),
          },
        ],
        payer: {
          email: user.email,
        },
        back_urls: {
          success: `${appUrl}/checkout/success`,
          pending: `${appUrl}/checkout/pending`,
          failure: `${appUrl}/checkout/failure`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        external_reference: purchase.id,
        metadata: {
          purchase_id: purchase.id,
          course_id: course.id,
          user_id: user.id,
        },
      },
    })
    initPoint = preference.init_point
  } catch (err) {
    console.error('Error creando preferencia de Mercado Pago', err)
  }

  if (!initPoint) {
    redirect(`/cursos/${slug}?error=${encodeURIComponent('No se pudo conectar con Mercado Pago, intenta de nuevo')}`)
    return
  }

  redirect(initPoint)
}
