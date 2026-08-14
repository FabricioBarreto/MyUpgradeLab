import { createClient } from "@/lib/supabase/server";
import { markAffiliatePaid } from "@/lib/actions/affiliates";
import { formatPrice } from "@/lib/format";
import { AFFILIATE_PAYOUT_HOLD_DAYS } from "@/lib/constants";

export default async function AdminAfiliadosPage() {
  const supabase = await createClient();

  const { data: affiliates } = await supabase
    .from("affiliates")
    .select("*, affiliate_referrals(commission_amount, status, created_at)")
    .order("created_at", { ascending: false });

  const holdCutoff = new Date();
  holdCutoff.setDate(holdCutoff.getDate() - AFFILIATE_PAYOUT_HOLD_DAYS);

  const rows = (affiliates ?? []).map((a) => {
    const referrals = (a.affiliate_referrals ?? []) as {
      commission_amount: number;
      status: string;
      created_at: string;
    }[];
    // Solo cuenta como "pendiente para pagar" lo que ya paso el periodo de
    // espera (ver AFFILIATE_PAYOUT_HOLD_DAYS). Lo pendiente que todavia no
    // madura no se muestra ni se suma aca — aparece solo (y automaticamente,
    // sin ninguna accion manual) una vez que cumple los 30 dias.
    const totalPending = referrals
      .filter(
        (r) => r.status === "pending" && new Date(r.created_at) <= holdCutoff,
      )
      .reduce((sum, r) => sum + Number(r.commission_amount), 0);
    const totalPaid = referrals
      .filter((r) => r.status === "paid")
      .reduce((sum, r) => sum + Number(r.commission_amount), 0);
    return { ...a, totalPending, totalPaid, referralCount: referrals.length };
  });

  rows.sort((a, b) => b.totalPending - a.totalPending);

  const grandTotalPending = rows.reduce((sum, r) => sum + r.totalPending, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Afiliados</h1>
        <p className="text-sm text-neutral-500">
          Total pendiente de pago:{" "}
          <span className="font-medium text-neutral-900">
            {formatPrice(grandTotalPending)}
          </span>
        </p>
      </div>
      <p className="mb-6 text-sm text-neutral-500">
        Pago manual el dia 10 de cada mes: transferí al alias/CBU de cada
        afiliado con saldo pendiente y despues marcalo como pagado aca.
      </p>

      <div className="space-y-3">
        {rows.map((a) => (
          <div
            key={a.id}
            className="rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Codigo: {a.code}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {a.payout_alias ? (
                    <>
                      Alias/CBU:{" "}
                      <span className="font-medium">{a.payout_alias}</span>
                    </>
                  ) : (
                    <span className="text-amber-600">
                      Todavia no cargo alias/CBU
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {a.referralCount} referido{a.referralCount === 1 ? "" : "s"}{" "}
                  en total — {a.commission_rate}% de comision
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500">Pendiente</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatPrice(a.totalPending)}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Pagado: {formatPrice(a.totalPaid)}
                </p>
              </div>
            </div>
            {a.totalPending > 0 && (
              <form
                action={markAffiliatePaid}
                encType="multipart/form-data"
                className="mt-3 flex flex-wrap items-end gap-3"
              >
                <input type="hidden" name="affiliateId" value={a.id} />
                <div>
                  <label className="block text-xs text-neutral-500">
                    Fecha de pago
                  </label>
                  <input
                    type="date"
                    name="paidDate"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="mt-1 rounded-md border border-neutral-300 px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500">
                    Comprobante (opcional, se borra a los 30 dias)
                  </label>
                  <input
                    type="file"
                    name="proof"
                    accept="image/*"
                    className="mt-1 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Marcar {formatPrice(a.totalPending)} como pagado
                </button>
              </form>
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-center text-neutral-400">
            Todavia no hay afiliados
          </p>
        )}
      </div>
    </div>
  );
}
