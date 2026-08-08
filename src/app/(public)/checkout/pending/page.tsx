import Link from "next/link"

export default function CheckoutPendingPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">Pago en proceso</h1>
      <p className="mt-3 text-neutral-600">
        Tu pago esta siendo procesado por Mercado Pago (comun en efectivo o transferencias).
        Te vamos a dar acceso apenas se acredite.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Ir a mi dashboard
      </Link>
    </div>
  )
}
