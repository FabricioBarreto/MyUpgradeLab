import Link from "next/link"
import { SUBSCRIPTION_PRICE } from "@/lib/constants"
import { TrackConversion } from "@/components/track-conversion"

// Confiabilidad del tracking en esta pagina:
// - Compra individual: Checkout Pro solo redirige aca cuando el pago quedo
//   aprobado (back_urls.success + auto_return: 'approved', ver checkout.ts),
//   asi que llegar a esta pantalla ya es señal suficiente para contar la
//   conversion, sin esperar la confirmacion del webhook.
// - Suscripcion: Preapproval no tiene esa misma distincion por resultado
//   (una sola back_url para todos los casos, ver subscribe.ts), asi que se
//   cuenta como conversion por llegar aca con type=suscripcion. El webhook
//   sigue siendo la unica fuente de verdad para dar acceso real; esto es
//   solo para medir que canal de marketing convierte.
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const isSubscription = params.type === "suscripcion"

  if (isSubscription) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">¡Suscripción activada!</h1>
        <p className="mt-3 text-neutral-600">
          Tu suscripción se acredito correctamente. Ya podes acceder a todo el catálogo desde tu
          dashboard.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Ir a mi dashboard
        </Link>
        <TrackConversion
          eventName="subscribe"
          eventParams={{
            currency: "ARS",
            value: SUBSCRIPTION_PRICE,
            items: [{ item_id: "suscripcion_mensual", item_name: "Suscripcion mensual" }],
          }}
        />
      </div>
    )
  }

  const courseId = typeof params.id === "string" ? params.id : undefined
  const title = typeof params.title === "string" ? params.title : undefined
  const amount = typeof params.amount === "string" ? Number(params.amount) : undefined

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">¡Pago aprobado!</h1>
      <p className="mt-3 text-neutral-600">
        Tu compra se acredito correctamente. Ya podes acceder al recurso desde tu dashboard.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Ir a mi dashboard
      </Link>
      {courseId && amount !== undefined && !Number.isNaN(amount) && (
        <TrackConversion
          eventName="purchase"
          eventParams={{
            currency: "ARS",
            value: amount,
            items: [{ item_id: courseId, item_name: title }],
          }}
        />
      )}
    </div>
  )
}
