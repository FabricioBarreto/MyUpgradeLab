import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions/auth"
import { createSubscription } from "@/lib/actions/subscribe"
import { CATEGORY_LABELS, categoryLabel, formatPrice } from "@/lib/format"
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

  const communityCategories = Object.keys(COMMUNITY_LINKS).filter((category) =>
    accessibleCategories.has(category)
  )

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-2 text-neutral-600">Hola, {user.email}</p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-lg font-medium text-neutral-900">Suscripcion</h2>
        {subscription ? (
          <div className="mt-3 flex items-center justify-between">
            <span
              className={
                subscription.status === "active"
                  ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                  : subscription.status === "cancelled" || subscription.status === "past_due"
                    ? "rounded-full bg-red-100 px-2 py-1 text-xs text-red-700"
                    : "rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-500"
              }
            >
              {SUBSCRIPTION_STATUS_LABELS[subscription.status] ?? subscription.status}
            </span>
            {(subscription.status === "cancelled" || subscription.status === "past_due") && (
              <form action={createSubscription}>
                <button
                  type="submit"
                  className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Suscribirme de nuevo
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-neutral-600">
              Acceso completo a todo el catalogo, con 7 dias de prueba gratis.
            </p>
            <form action={createSubscription} className="mt-3">
              <button
                type="submit"
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Suscribirme
              </button>
            </form>
          </div>
        )}
      </div>

      {isSubscribed && subscribedCourses && subscribedCourses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-neutral-900">Cursos incluidos en tu suscripcion</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Acceso completo a todo el catalogo mientras tu suscripcion este activa.
          </p>
          <div className="mt-4 space-y-3">
            {subscribedCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-neutral-900">{course.title}</p>
                  <p className="text-sm text-neutral-500">{categoryLabel(course.category)}</p>
                </div>
                {course.resource_url && (
                  <a
                    href={course.resource_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-neutral-900 hover:underline"
                  >
                    Acceder
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-medium text-neutral-900">Mis compras</h2>

        {purchases && purchases.length > 0 ? (
          <div className="mt-4 space-y-3">
            {purchases.map((purchase) => {
              const course = purchase.courses as {
                title: string
                category: string | null
                resource_url: string | null
              } | null

              return (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{course?.title ?? "Curso"}</p>
                    <p className="text-sm text-neutral-500">
                      {categoryLabel(course?.category ?? null)} — {formatPrice(purchase.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        purchase.status === "approved"
                          ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                          : purchase.status === "rejected"
                            ? "rounded-full bg-red-100 px-2 py-1 text-xs text-red-700"
                            : "rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-500"
                      }
                    >
                      {PURCHASE_STATUS_LABELS[purchase.status] ?? purchase.status}
                    </span>
                    {purchase.status === "approved" && course?.resource_url && (
                      <a
                        href={course.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-neutral-900 hover:underline"
                      >
                        Acceder
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Todavia no compraste ningun curso.{" "}
            <Link href="/cursos" className="font-medium text-neutral-900 hover:underline">
              Ver catalogo
            </Link>
          </p>
        )}
      </div>

      {communityCategories.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-neutral-900">Comunidad</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Sumate al grupo de las categorias a las que tenes acceso.
          </p>
          <div className="mt-4 space-y-3">
            {communityCategories.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4"
              >
                <span className="font-medium text-neutral-900">{categoryLabel(category)}</span>
                <a
                  href={COMMUNITY_LINKS[category]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Unirme
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <form action={signOut} className="mt-10">
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Cerrar sesion
        </button>
      </form>
    </div>
  )
}
