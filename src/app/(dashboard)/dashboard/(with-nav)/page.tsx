import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createSubscription } from "@/lib/actions/subscribe"
import { CATEGORY_LABELS, categoryLabel, categoryBadgeClass, formatPrice } from "@/lib/format"
import { COMMUNITY_LINKS } from "@/lib/community"

const PURCHASE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  refunded: "Reembolsado",
}

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente de pago",
  active: "Activa",
  cancelled: "Cancelada",
  paused: "Pausada",
  past_due: "Pago vencido",
}

function StatusBadge({ tone, children }: { tone: "green" | "red" | "neutral"; children: React.ReactNode }) {
  const toneClass =
    tone === "green"
      ? "bg-green-100 text-green-700"
      : tone === "red"
        ? "bg-red-100 text-red-700"
        : "bg-neutral-100 text-neutral-500"
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${toneClass}`}>{children}</span>
}

function TermsConsent() {
  return (
    <label className="mb-3 flex items-start gap-2 text-xs text-neutral-500">
      <input type="checkbox" required className="mt-0.5" />
      <span>
        Acepto los{" "}
        <Link href="/terminos" className="underline hover:text-neutral-900">
          Términos y Condiciones
        </Link>{" "}
        y entiendo que, al acceder al contenido, pierdo el derecho de arrepentimiento sobre ese
        período (ver{" "}
        <Link href="/reembolsos" className="underline hover:text-neutral-900">
          Política de Reembolsos
        </Link>
        ).
      </span>
    </label>
  )
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle()

  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, courses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Categorias a las que el usuario tiene acceso: todas si tiene suscripcion
  // activa, o solo las de sus compras aprobadas.
  const isSubscribed = subscription?.status === "active"
  const purchasedCategories = new Set(
    (purchases ?? [])
      .filter((p) => p.status === "approved")
      .map((p) => (p.courses as { category: string | null } | null)?.category)
      .filter((c): c is string => Boolean(c))
  )
  const accessibleCategories = isSubscribed
    ? new Set(Object.keys(CATEGORY_LABELS))
    : purchasedCategories

  // Agrupamos por URL, no por categoria: hoy varias categorias comparten la
  // misma Comunidad de WhatsApp (ver community.ts), y sin esto un suscriptor
  // con acceso a todo el catalogo veria la misma tarjeta de "Unirme"
  // repetida una vez por categoria.
  const communityLinksByUrl = new Map<string, string[]>()
  for (const category of Object.keys(COMMUNITY_LINKS)) {
    const url = COMMUNITY_LINKS[category]
    if (!url || !accessibleCategories.has(category)) continue
    communityLinksByUrl.set(url, [...(communityLinksByUrl.get(url) ?? []), category])
  }
  const communityEntries = Array.from(communityLinksByUrl.entries())

  // Con suscripcion activa el acceso es a todo el catalogo, no solo a lo
  // que aparece en `purchases` (esa tabla es historial de compras
  // individuales). Traemos todos los cursos activos para listarlos aca.
  const { data: subscribedCourses } = isSubscribed
    ? await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })
    : { data: null }

  const displayName = profile?.full_name?.trim().split(" ")[0] || user.email?.split("@")[0] || "de nuevo"

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold text-neutral-900 sm:text-3xl">Hola, {displayName}</h1>
      <p className="mt-1 text-neutral-500">Tu resumen de UpgradeLab.</p>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Suscripcion */}
      <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-neutral-900">Suscripción</h2>
          {subscription ? (
            <StatusBadge
              tone={
                subscription.status === "active"
                  ? "green"
                  : subscription.status === "cancelled" || subscription.status === "past_due"
                    ? "red"
                    : "neutral"
              }
            >
              {SUBSCRIPTION_STATUS_LABELS[subscription.status] ?? subscription.status}
            </StatusBadge>
          ) : (
            <StatusBadge tone="neutral">Sin suscripción</StatusBadge>
          )}
        </div>

        {subscription ? (
          (subscription.status === "cancelled" || subscription.status === "past_due") && (
            <form action={createSubscription} className="mt-4 max-w-md">
              <TermsConsent />
              <button
                type="submit"
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Suscribirme de nuevo
              </button>
            </form>
          )
        ) : (
          <div className="mt-4 max-w-md">
            <p className="text-sm text-neutral-600">
              Acceso completo a todo el catálogo mientras la suscripción esté activa.
            </p>
            <form action={createSubscription} className="mt-3">
              <TermsConsent />
              <button
                type="submit"
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Suscribirme
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Cursos por suscripcion */}
      {isSubscribed && subscribedCourses && subscribedCourses.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium text-neutral-900">Cursos incluidos en tu suscripción</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Acceso completo a todo el catálogo mientras tu suscripción esté activa.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subscribedCourses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(course.category)}`}
                  >
                    {categoryLabel(course.category)}
                  </span>
                  <p className="mt-2 font-medium leading-snug text-neutral-900">{course.title}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(course.resource_url || course.content_html) && (
                    <Link
                      href={`/dashboard/leer/${course.slug}`}
                      className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
                    >
                      Leer
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mis compras */}
      <section className="mt-10">
        <h2 className="text-lg font-medium text-neutral-900">Mis compras</h2>

        {purchases && purchases.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {purchases.map((purchase) => {
              const course = purchase.courses as {
                id: string
                slug: string
                title: string
                category: string | null
                resource_url: string | null
              } | null

              return (
                <div
                  key={purchase.id}
                  className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(course?.category ?? null)}`}
                      >
                        {categoryLabel(course?.category ?? null)}
                      </span>
                      <StatusBadge
                        tone={
                          purchase.status === "approved"
                            ? "green"
                            : purchase.status === "rejected"
                              ? "red"
                              : "neutral"
                        }
                      >
                        {PURCHASE_STATUS_LABELS[purchase.status] ?? purchase.status}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 font-medium leading-snug text-neutral-900">
                      {course?.title ?? "Curso"}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">{formatPrice(purchase.amount)}</p>
                  </div>
                  {purchase.status === "approved" && course && course.resource_url && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        href={`/api/cursos/${course.slug}/leer`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
                      >
                        Descargar
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Todavía no compraste ningún curso.{" "}
            <Link href="/cursos" className="font-medium text-neutral-900 hover:underline">
              Ver catálogo
            </Link>
          </p>
        )}
      </section>

      {/* Comunidad */}
      {communityEntries.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium text-neutral-900">Comunidad</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Sumate a la comunidad de las categorías a las que tenés acceso.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communityEntries.map(([url, categories]) => (
              <div
                key={url}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
              >
                <span className="font-medium text-neutral-900">
                  {categories.length > 1 ? "UpgradeLab" : categoryLabel(categories[0])}
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Unirme
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Accesos rapidos */}
      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/afiliados"
          className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
        >
          <p className="font-medium text-neutral-900">Programa de afiliados</p>
          <p className="mt-1 text-sm text-neutral-500">Ganá 40% por cada referido →</p>
        </Link>
        <Link
          href="/sugerencias"
          className="rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300"
        >
          <p className="font-medium text-neutral-900">Sugerencias</p>
          <p className="mt-1 text-sm text-neutral-500">Tenés una idea? Contanos →</p>
        </Link>
      </section>
    </div>
  )
}
