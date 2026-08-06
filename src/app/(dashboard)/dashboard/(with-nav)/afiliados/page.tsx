import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { becomeAffiliate, updatePayoutAlias } from "@/lib/actions/affiliates"
import { formatPrice } from "@/lib/format"
import { getAppUrl } from "@/lib/constants"

const REFERRAL_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente de pago",
  paid: "Pagada",
}

export default async function AfiliadosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!affiliate) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Volver al dashboard
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Programa de afiliados</h1>
        <p className="mt-2 text-neutral-600">
          Recomenda UpgradeLab con tu link y ganá 40% de comision en efectivo por cada compra o
          suscripcion que se genere a traves tuyo.
        </p>

        <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
          <form action={becomeAffiliate}>
            <button
              type="submit"
              className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Quiero ser afiliado
            </button>
          </form>
        </div>
      </div>
    )
  }

  const { data: referrals } = await supabase
    .from("affiliate_referrals")
    .select("*")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false })

  const referralLink = `${getAppUrl()}/?ref=${affiliate.code}`

  const totalPending = (referrals ?? [])
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0)
  const totalPaid = (referrals ?? [])
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0)

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Volver al dashboard
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">Tu programa de afiliados</h1>
      <p className="mt-2 text-neutral-600">
        Comision: {affiliate.commission_rate}% en efectivo por cada compra o suscripcion aprobada.
        Pagamos por transferencia el dia 10 de cada mes, sobre lo acumulado hasta ese momento.
      </p>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium text-neutral-700">Tu link para compartir</p>
        <p className="mt-2 break-all rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-900">
          {referralLink}
        </p>
        <p className="mt-2 text-xs text-neutral-400">Codigo: {affiliate.code}</p>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium text-neutral-700">Alias o CBU para cobrar</p>
        <p className="mt-1 text-xs text-neutral-500">
          Lo necesitamos para poder transferirte tu comision el dia de pago.
        </p>
        <form action={updatePayoutAlias} className="mt-3 flex gap-2">
          <input
            type="text"
            name="payoutAlias"
            defaultValue={affiliate.payout_alias ?? ""}
            placeholder="mi.alias.mp o CBU de 22 digitos"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Guardar
          </button>
        </form>
        {!affiliate.payout_alias && (
          <p className="mt-2 text-xs text-amber-600">
            Todavia no cargaste un alias/CBU — no vamos a poder pagarte hasta que lo hagas.
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center">
          <p className="text-xs text-neutral-500">Pendiente de cobro</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{formatPrice(totalPending)}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center">
          <p className="text-xs text-neutral-500">Ya cobrado</p>
          <p className="mt-1 text-xl font-semibold text-neutral-900">{formatPrice(totalPaid)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-neutral-900">Referidos</h2>

        {referrals && referrals.length > 0 ? (
          <div className="mt-4 space-y-3">
            {referrals.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-neutral-900">
                    {r.source_type === "purchase" ? "Compra individual" : "Suscripcion"}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {new Date(r.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-neutral-900">{formatPrice(r.commission_amount)}</p>
                  <span
                    className={
                      r.status === "paid"
                        ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                        : "rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700"
                    }
                  >
                    {REFERRAL_STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Todavia no tenes referidos. Compartí tu link para empezar a ganar comisiones.
          </p>
        )}
      </div>
    </div>
  )
}
