import Link from "next/link"

export default function CheckoutSuccessPage() {
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
    </div>
  )
}
