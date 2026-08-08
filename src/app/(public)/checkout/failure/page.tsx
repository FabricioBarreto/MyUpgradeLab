import Link from "next/link"

export default function CheckoutFailurePage() {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">No pudimos procesar el pago</h1>
      <p className="mt-3 text-neutral-600">
        El pago fue rechazado o cancelado. Podes intentar de nuevo desde el catalogo.
      </p>
      <Link
        href="/cursos"
        className="mt-6 inline-block rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Volver al catalogo
      </Link>
    </div>
  )
}
