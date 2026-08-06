import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Programa de Afiliados — UpgradeLab",
}

export default async function AfiliadosLandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">Programa de Afiliados</h1>
      <p className="mt-3 text-neutral-600">
        Recomendá UpgradeLab con tu link propio y ganá 30% de comisión en efectivo por cada compra
        o suscripción que se genere a través tuyo. No hace falta que compres nada — con crear tu
        cuenta ya podés generar tu link.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm font-medium text-neutral-900">1. Te registrás</p>
          <p className="mt-1 text-sm text-neutral-500">Creás tu cuenta gratis en un minuto.</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm font-medium text-neutral-900">2. Compartís tu link</p>
          <p className="mt-1 text-sm text-neutral-500">
            Cada persona que compre o se suscriba a través de tu link queda asociada a vos.
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-sm font-medium text-neutral-900">3. Cobrás</p>
          <p className="mt-1 text-sm text-neutral-500">
            Pagamos por transferencia el día 10 de cada mes, sobre lo acumulado hasta ese momento.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-sm font-medium text-neutral-700">
          Para ver tu link, cuánto acumulaste y cuándo cobrás, iniciá sesión o registrate:
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/login?redirect=/dashboard/afiliados"
            className="rounded-md border border-neutral-300 py-3 text-center text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register?intent=affiliate"
            className="rounded-md bg-neutral-900 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
          >
            Registrarme como afiliado
          </Link>
        </div>
        {user && (
          <p className="mt-4 text-center text-sm text-neutral-500">
            Ya iniciaste sesión —{" "}
            <Link href="/dashboard/afiliados" className="font-medium text-neutral-900 hover:underline">
              ir directo a tu panel de afiliado
            </Link>
            .
          </p>
        )}
        <p className="mt-4 text-center text-xs text-neutral-500">
          Condiciones completas en los{" "}
          <Link href="/terminos" className="underline hover:text-neutral-900">
            Términos y Condiciones
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
