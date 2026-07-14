import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { accessTypeLabel, categoryLabel, formatPrice } from "@/lib/format"
import { createCheckoutPreference } from "@/lib/actions/checkout"

export default async function CursoDetallePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { slug } = await params
  const { error } = await searchParams

  const supabase = await createClient()
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!course) {
    notFound()
  }

  const canBuyIndividual = course.access_type === "individual" || course.access_type === "both"

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/cursos" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Volver al catalogo
      </Link>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {categoryLabel(course.category)}
          </span>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{course.title}</h1>
          {course.access_type && (
            <p className="mt-1 text-sm text-neutral-500">{accessTypeLabel(course.access_type)}</p>
          )}
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <span className="text-2xl font-semibold text-neutral-900">
            {formatPrice(course.price)}
          </span>
        </div>
      </div>

      {course.description && (
        <p className="mt-6 whitespace-pre-line text-neutral-700">{course.description}</p>
      )}

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
        {canBuyIndividual ? (
          <form action={createCheckoutPreference}>
            <input type="hidden" name="courseId" value={course.id} />
            <input type="hidden" name="slug" value={slug} />
            <button
              type="submit"
              className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Comprar — {formatPrice(course.price)}
            </button>
          </form>
        ) : (
          <>
            <button
              disabled
              className="w-full cursor-not-allowed rounded-md bg-neutral-300 py-3 text-sm font-medium text-neutral-600"
            >
              Disponible por suscripcion — Proximamente
            </button>
            <p className="mt-3 text-center text-sm text-neutral-500">
              La suscripcion mensual todavia no esta habilitada.{" "}
              <Link href="/register" className="font-medium text-neutral-900 hover:underline">
                Creá tu cuenta
              </Link>{" "}
              para enterarte apenas este disponible.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
