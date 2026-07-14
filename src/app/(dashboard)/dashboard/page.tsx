import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions/auth"
import { categoryLabel, formatPrice } from "@/lib/format"

const PURCHASE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  refunded: "Reembolsado",
}

export default async function DashboardPage() {
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <p className="mt-2 text-neutral-600">Hola, {user.email}</p>

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
