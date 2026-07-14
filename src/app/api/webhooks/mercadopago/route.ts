import { NextRequest, NextResponse } from "next/server"
import { Payment } from "mercadopago"
import { WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago"
import { getMercadoPagoConfig } from "@/lib/mercadopago"
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

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id")
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic")

  const secret = process.env.MP_WEBHOOK_SECRET
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

  // Solo nos interesan las notificaciones de pagos individuales (Checkout Pro).
  if (type !== "payment" || !dataId) {
    return NextResponse.json({ received: true })
  }

  try {
    const paymentClient = new Payment(getMercadoPagoConfig())
    const payment = await paymentClient.get({ id: dataId })

    const purchaseId = payment.external_reference
    if (!purchaseId) {
      console.error("Pago de Mercado Pago sin external_reference", payment.id)
      return NextResponse.json({ received: true })
    }

    const supabase = createServiceClient()
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

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
