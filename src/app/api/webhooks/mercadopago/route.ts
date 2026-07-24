import { NextRequest, NextResponse } from "next/server"
import { Payment, PreApproval } from "mercadopago"
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago"
import { getMercadoPagoConfig, getMercadoPagoWebhookSecret } from "@/lib/mercadopago"
import { createServiceClient } from "@/lib/supabase/service"

// Mapea el status de un pago de Mercado Pago al status que usamos en `purchases`.
function mapPaymentStatus(mpStatus: string | undefined): string {
  switch (mpStatus) {
    case "approved":
      return "approved"
    case "rejected":
      return "rejected"
    case "refunded":
    case "charged_back":
      return "refunded"
    default:
      // in_process, pending, authorized, etc.
      return "pending"
  }
}

// Mapea el status de una suscripcion (preapproval) de Mercado Pago al status
// que usamos en `subscriptions`.
function mapSubscriptionStatus(mpStatus: string | undefined): string {
  switch (mpStatus) {
    case "authorized":
      return "active"
    case "cancelled":
      return "cancelled"
    case "paused":
      return "paused"
    default:
      // pending
      return "pending"
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  // Checkout Pro notifica via query params en el notification_url (IPN
  // clasico). Suscripciones (Webhooks v2) manda un body JSON con type/data.id.
  // Soportamos ambos formatos.
  const body: { type?: string; data?: { id?: string } } | null = await request
    .json()
    .catch(() => null)

  const dataId =
    body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id")
  const type = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic")

  const isPaymentEvent = type === "payment"
  const isSubscriptionEvent = type === "subscription_preapproval" || type === "preapproval"

  if (!dataId || (!isPaymentEvent && !isSubscriptionEvent)) {
    return NextResponse.json({ received: true })
  }

  const app = isPaymentEvent ? "checkout" : "suscripciones"
  const secret = getMercadoPagoWebhookSecret(app)

  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret,
      })
    } catch (err) {
      if (err instanceof InvalidWebhookSignatureError) {
        console.error("Firma de webhook invalida", err.reason)
        return NextResponse.json({ error: "invalid signature" }, { status: 401 })
      }
      throw err
    }
  }

  const supabase = createServiceClient()

  try {
    if (isPaymentEvent) {
      const paymentClient = new Payment(getMercadoPagoConfig("checkout"))
      const payment = await paymentClient.get({ id: dataId })

      const purchaseId = payment.external_reference
      if (!purchaseId) {
        console.error("Pago de Mercado Pago sin external_reference", payment.id)
        return NextResponse.json({ received: true })
      }

      const { error } = await supabase
        .from("purchases")
        .update({
          status: mapPaymentStatus(payment.status),
          mp_payment_id: String(payment.id),
        })
        .eq("id", purchaseId)

      if (error) {
        console.error("Error actualizando purchase desde webhook", error)
        return NextResponse.json({ error: "db error" }, { status: 500 })
      }
    } else {
      const preapprovalClient = new PreApproval(getMercadoPagoConfig("suscripciones"))
      const preapproval = await preapprovalClient.get({ id: dataId })

      const subscriptionId = preapproval.external_reference
      if (!subscriptionId) {
        console.error("Suscripcion de Mercado Pago sin external_reference", preapproval.id)
        return NextResponse.json({ received: true })
      }

      const status = mapSubscriptionStatus(preapproval.status)
      const { error } = await supabase
        .from("subscriptions")
        .update({
          status,
          mp_subscription_id: String(preapproval.id),
        })
        .eq("id", subscriptionId)

      if (error) {
        console.error("Error actualizando subscription desde webhook", error)
        return NextResponse.json({ error: "db error" }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
