import { NextRequest, NextResponse } from "next/server"
import { Payment, PreApproval } from "mercadopago"
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago"
import { getMercadoPagoConfig, getMercadoPagoWebhookSecret } from "@/lib/mercadopago"
import { createServiceClient } from "@/lib/supabase/service"
import { sendPurchaseApprovedEmail, sendSubscriptionActiveEmail } from "@/lib/email"
import { SUBSCRIPTION_PRICE } from "@/lib/constants"

type ServiceClient = ReturnType<typeof createServiceClient>

// Si el usuario que acaba de comprar/suscribirse fue traido por un afiliado
// (profiles.referred_by_affiliate_id), le acreditamos su comision. Se llama
// solo en la transicion a "recien aprobado", y chequea que no exista ya una
// fila para este source_id antes de insertar — asi los reintentos de webhook
// de Mercado Pago no duplican la comision.
async function creditAffiliateCommission(
  supabase: ServiceClient,
  {
    userId,
    sourceType,
    sourceId,
    amount,
  }: { userId: string; sourceType: "purchase" | "subscription"; sourceId: string; amount: number }
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("referred_by_affiliate_id")
    .eq("id", userId)
    .maybeSingle()

  if (!profile?.referred_by_affiliate_id) return

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id, commission_rate, status")
    .eq("id", profile.referred_by_affiliate_id)
    .maybeSingle()

  if (!affiliate || affiliate.status !== "approved") return

  const { data: existingReferral } = await supabase
    .from("affiliate_referrals")
    .select("id")
    .eq("source_id", sourceId)
    .maybeSingle()

  if (existingReferral) return

  const commissionAmount = Math.round((amount * Number(affiliate.commission_rate)) / 100)

  const { error } = await supabase.from("affiliate_referrals").insert({
    affiliate_id: affiliate.id,
    referred_user_id: userId,
    source_type: sourceType,
    source_id: sourceId,
    commission_amount: commissionAmount,
    status: "pending",
  })

  if (error) {
    console.error("Error acreditando comision de afiliado", error)
  }
}

// Los emails transaccionales nunca deben tirar abajo el webhook: si el envio
// falla (SMTP caido, credenciales mal, etc.) lo logueamos y seguimos.
async function sendEmailSafely(fn: () => Promise<void>) {
  try {
    await fn()
  } catch (err) {
    console.error("Error enviando email transaccional", err)
  }
}

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

// El evento "Pagos (legacy)" de Checkout Pro usa el mecanismo viejo de IPN,
// que a veces llega como GET (no POST) con topic/id en query params. Por eso
// exportamos GET y POST con la misma logica (ver abajo).
export async function GET(request: NextRequest) {
  return handleNotification(request)
}

export async function POST(request: NextRequest) {
  return handleNotification(request)
}

async function handleNotification(request: NextRequest) {
  const url = new URL(request.url)
  // Checkout Pro notifica via query params en el notification_url (IPN
  // clasico, a veces GET). Suscripciones (Webhooks v2) manda un body JSON
  // con type/data.id via POST. Soportamos ambos formatos.
  const body: { type?: string; data?: { id?: string } } | null =
    request.method === "POST" ? await request.json().catch(() => null) : null

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

      // Traemos el estado previo antes de actualizar para saber si esta
      // notificacion es la que recien aprueba el pago (y no un reenvio de
      // MP de un pago que ya estaba approved).
      const { data: existingPurchase } = await supabase
        .from("purchases")
        .select("status, user_id, amount, courses(title, resource_url)")
        .eq("id", purchaseId)
        .maybeSingle()

      const newStatus = mapPaymentStatus(payment.status)

      const { error } = await supabase
        .from("purchases")
        .update({
          status: newStatus,
          mp_payment_id: String(payment.id),
        })
        .eq("id", purchaseId)

      if (error) {
        console.error("Error actualizando purchase desde webhook", error)
        return NextResponse.json({ error: "db error" }, { status: 500 })
      }

      if (existingPurchase && existingPurchase.status !== "approved" && newStatus === "approved") {
        const course = existingPurchase.courses as unknown as {
          title: string
          resource_url: string | null
        } | null
        const { data: userData } = await supabase.auth.admin.getUserById(existingPurchase.user_id)
        const email = userData?.user?.email

        if (email && course) {
          await sendEmailSafely(() =>
            sendPurchaseApprovedEmail({
              to: email,
              courseTitle: course.title,
              resourceUrl: course.resource_url,
            })
          )
        }

        await creditAffiliateCommission(supabase, {
          userId: existingPurchase.user_id,
          sourceType: "purchase",
          sourceId: purchaseId,
          amount: Number(existingPurchase.amount),
        })
      }
    } else {
      const preapprovalClient = new PreApproval(getMercadoPagoConfig("suscripciones"))
      const preapproval = await preapprovalClient.get({ id: dataId })

      const subscriptionId = preapproval.external_reference
      if (!subscriptionId) {
        console.error("Suscripcion de Mercado Pago sin external_reference", preapproval.id)
        return NextResponse.json({ received: true })
      }

      const { data: existingSubscription } = await supabase
        .from("subscriptions")
        .select("status, user_id")
        .eq("id", subscriptionId)
        .maybeSingle()

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

      if (existingSubscription && existingSubscription.status !== "active" && status === "active") {
        const { data: userData } = await supabase.auth.admin.getUserById(existingSubscription.user_id)
        const email = userData?.user?.email

        if (email) {
          await sendEmailSafely(() => sendSubscriptionActiveEmail({ to: email }))
        }

        await creditAffiliateCommission(supabase, {
          userId: existingSubscription.user_id,
          sourceType: "subscription",
          sourceId: subscriptionId,
          amount: SUBSCRIPTION_PRICE,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
