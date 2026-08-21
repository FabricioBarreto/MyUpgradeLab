import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { becomeAffiliate, updatePayoutAlias } from "@/lib/actions/affiliates"
import { formatPrice } from "@/lib/format"
import { getAppUrl, AFFILIATE_PAYOUT_HOLD_DAYS } from "@/lib/constants"
import { CopyLinkButton } from "@/components/copy-link-button"

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
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Programa de afiliados</h1>
        <p className="mt-2 text-neutral-600">
          Recomenda UpgradeLab con tu link y ganá 40% de comision en efectivo por cada compra o
          suscripcion que se genere a traves tuyo.
        </p>

        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
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
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Te comparto UpgradeLab, cursos practicos de programacion con IA, ingles tecnico y mas: ${referralLink}`
  )}`

  // Misma logica de madurez que /admin/afiliados: una comision pendiente
  // recien se puede cobrar 30 dias despues de generada. Ahi la mostramos
  // como "disponible"; antes de eso, como "en camino" con la fecha exacta —
  // asi el afiliado ve que el link funciono, en vez de un $0 confuso.
  const holdCutoff = new Date()
  holdCutoff.setDate(holdCutoff.getDate() - AFFILIATE_PAYOUT_HOLD_DAYS)

  const isMatured = (createdAt: string) => new Date(createdAt) <= holdCutoff

  const releaseDateOf = (createdAt: string) => {
    const d = new Date(createdAt)
    d.setDate(d.getDate() + AFFILIATE_PAYOUT_HOLD_DAYS)
    return d
  }

  const totalAvailable = (referrals ?? [])
    .filter((r) => r.status === "pending" && isMatured(r.created_at))
    .reduce((sum, r) => sum + Number(r.commission_amount), 0)
  const upcomingReferrals = (referrals ?? []).filter(
    (r) => r.status === "pending" && !isMatured(r.created_at)
  )
  const totalUpcoming = upcomingReferrals.reduce(
    (sum, r) => sum + Number(r.commission_amount),
    0
  )
  const totalPaid = (referrals ?? [])
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0)

  const nextRelease = upcomingReferrals
    .map((r) => releaseDateOf(r.created_at))
    .sort((a, b) => a.getTime() - b.getTime())[0]

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Tu programa de afiliados</h1>
      <p className="mt-2 text-neutral-600">
        Comision: {affiliate.commission_rate}% en efectivo por cada compra o suscripcion aprobada.
        Pagamos por transferencia el dia 10 de cada mes, sobre lo acumulado hasta ese momento.
      </p>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium text-neutral-700">Tu link para compartir</p>
        <div className="mt-2 flex items-center gap-2">
          <p className="min-w-0 flex-1 break-all rounded-md bg-neutral-50 px-3 py-2 text-sm text-neutral-900">
            {referralLink}
          </p>
          <CopyLinkButton link={referralLink} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-neutral-400">Codigo: {affiliate.code}</p>
          
            <a
          href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-green-700 hover:underline"
          >
            Compartir por WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium text-neutral-700">Alias o CBU para cobrar</p>
        <p className="mt-1 text-xs text-neutral-500">
          Lo necesitamos para poder transferirte tu comision el dia de pago.
        </p>
        <form action={updatePayoutAlias} className="mt-3 flex flex-col gap-2">
          <input
            type="text"
            name="payoutName"
            defaultValue={affiliate.payout_name ?? ""}
            placeholder="Nombre y apellido del titular de la cuenta"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
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
          </div>
        </form>
        {(!affiliate.payout_alias || !affiliate.payout_name) && (
          <p className="mt-2 text-xs text-amber-600">
            Todavia no cargaste el nombre del titular y/o el alias/CBU — no vamos a poder pagarte hasta que completes los dos.
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
          <p className="text-xs text-neutral-500">Disponible</p>
          <p className="mt-1 text-lg font-semibold text-neutral-900">{formatPrice(totalAvailable)}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
          <p className="text-xs text-neutral-500">En camino</p>
          <p className="mt-1 text-lg font-semibold text-neutral-500">{formatPrice(totalUpcoming)}</p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
          <p className="text-xs text-neutral-500">Ya cobrado</p>
          <p className="mt-1 text-lg font-semibold text-neutral-900">{formatPrice(totalPaid)}</p>
        </div>
      </div>
      {totalUpcoming > 0 && nextRelease && (
        <p className="mt-2 text-xs text-neutral-400">
          Tu proxima comision queda disponible el {nextRelease.toLocaleDateString("es-AR")}.
        </p>
      )}

      <div className="mt-10">
        <h2 className="text-lg font-medium text-neutral-900">Referidos</h2>

        {referrals && referrals.length > 0 ? (
          <div className="mt-4 space-y-3">
            {referrals.map((r) => {
              const label =
                r.status === "paid"
                  ? "Pagada"
                  : isMatured(r.created_at)
                    ? "Disponible"
                    : `Disponible el ${releaseDateOf(r.created_at).toLocaleDateString("es-AR")}`
              const badgeClass =
                r.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : isMatured(r.created_at)
                    ? "bg-amber-100 text-amber-700"
                    : "bg-neutral-100 text-neutral-500"

              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
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
                    <span className={`rounded-full px-2 py-1 text-xs ${badgeClass}`}>{label}</span>
                  </div>
                </div>
              )
            })}
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
