'use server'

import { redirect } from 'next/navigation'
import { PreApproval } from 'mercadopago'
import type { PreApprovalRequest } from 'mercadopago/dist/clients/preApproval/commonTypes'
import { createClient } from '@/lib/supabase/server'
import { getMercadoPagoConfig } from '@/lib/mercadopago'
import { SUBSCRIPTION_PRICE, getAppUrl } from '@/lib/constants'

// Regla de negocio definida en docs/MASTER.md: precio fijo de la suscripcion
// mensual, sin periodo de prueba gratuita (se probo con 7 dias y se saco por
// decision del fundador, 08/08/2026 — el cobro se hace desde el primer dia).
// Se revisa trimestralmente contra inflacion (proceso manual, no automatizado).

// Crea una suscripcion mensual sin plan asociado (ad-hoc) y de pago
// pendiente: Mercado Pago devuelve un init_point y el usuario completa el
// pago alli mismo, igual que con Checkout Pro. El webhook actualiza el
// estado real cuando MP confirma la autorizacion.
export async function createSubscription() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?message=${encodeURIComponent('Inicia sesion para suscribirte')}&redirect=/dashboard`)
  }

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'pending'])
    .maybeSingle()

  if (existing) {
    redirect(`/dashboard?error=${encodeURIComponent('Ya tenes una suscripcion activa o en proceso')}`)
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      status: 'pending',
    })
    .select()
    .single()

  if (subscriptionError || !subscription) {
    redirect(`/dashboard?error=${encodeURIComponent('No se pudo iniciar la suscripcion, intenta de nuevo')}`)
    return
  }

  const appUrl = getAppUrl()

  let initPoint: string | undefined

  try {
    const preapprovalClient = new PreApproval(getMercadoPagoConfig('suscripciones'))
    // El SDK de Mercado Pago (v3.2.0) tipa `auto_recurring` sin `free_trial`
    // para el create de Preapproval, aunque la API si lo acepta (esta
    // documentado y el tipo `AutoRecurringWithFreeTrial` existe para otras
    // operaciones). Casteamos para no perder el chequeo de tipos del resto
    // del body.
    // Nota: a diferencia de Preference (Checkout Pro), Preapproval no acepta
    // `notification_url` por request; las notificaciones de suscripcion se
    // configuran centralizadas en el panel de MP (Notificaciones > Webhooks).
    const body = {
      reason: 'Suscripcion mensual UpgradeLab',
      external_reference: subscription.id,
      payer_email: user.email,
      // A diferencia de Preference, Preapproval no tiene back_urls separadas
      // por resultado (approved/pending/failure) — usamos la misma pagina de
      // exito que la compra individual, distinguida por type=suscripcion,
      // para poder disparar el evento GA4 "subscribe" (ver checkout/success).
      back_url: `${appUrl}/checkout/success?type=suscripcion`,
      status: 'pending',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: SUBSCRIPTION_PRICE,
        currency_id: 'ARS',
      },
    } as PreApprovalRequest

    const preapproval = await preapprovalClient.create({ body })
    initPoint = preapproval.init_point
  } catch (err) {
    console.error('Error creando preapproval de Mercado Pago', err)
  }

  if (!initPoint) {
    // Limpiar la fila pending que no llego a generar checkout, para no dejar
    // basura que bloquee un proximo intento (ver chequeo de `existing` arriba).
    await supabase.from('subscriptions').delete().eq('id', subscription.id)
    redirect(`/dashboard?error=${encodeURIComponent('No se pudo conectar con Mercado Pago, intenta de nuevo')}`)
    return
  }

  redirect(initPoint)
}
