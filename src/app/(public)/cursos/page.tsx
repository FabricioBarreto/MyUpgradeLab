import Link from "next/link"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { CATEGORY_LABELS, categoryLabel, categoryBadgeClass, formatPrice } from "@/lib/format"

export const metadata: Metadata = {
  title: "Catálogo de cursos",
  description: "Programación con IA, estudio con IA, inglés, entrevistas de trabajo y negocio para freelancers. Compra individual o suscripción mensual.",
}

export default async function CursosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const params = await searchParams
  const categoria = params.categoria

  const supabase = await createClient()
  let query = supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("title", { ascending: true })

  if (categoria) {
    query = query.eq("category", categoria)
  }

  const { data: courses } = await query

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-neutral-900">Catalogo de cursos</h1>
      <p className="mt-2 text-neutral-600">
        Compra individual o suscripcion mensual con acceso a todo el catalogo.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/cursos"
          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
            !categoria
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          Todas
        </Link>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/cursos?categoria=${key}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              categoria === key
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <Link
            key={course.id}
            href={`/cursos/${course.slug}`}
            className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
          >
            <span
              className={`inline-block w-fit rounded-full px-2.5 py-1 text-xs font-medium ${categoryBadgeClass(course.category)}`}
            >
              {categoryLabel(course.category)}
            </span>
            <h3 className="mt-3 font-medium leading-snug text-neutral-900 group-hover:text-neutral-700">
              {course.title}
            </h3>
            {course.description && (
              <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{course.description}</p>
            )}
            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
              <span className="text-lg font-semibold text-neutral-900">
                {formatPrice(course.price)}
              </span>
              <span className="text-sm font-medium text-neutral-400 group-hover:text-neutral-900">
                Ver más →
              </span>
            </div>
          </Link>
        ))}

        {(!courses || courses.length === 0) && (
          <p className="col-span-full py-12 text-center text-neutral-400">
            Todavia no hay cursos disponibles en esta categoria.
          </p>
        )}
      </div>
    </div>
  )
}
