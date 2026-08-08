import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { accessTypeLabel, categoryLabel, formatPrice } from "@/lib/format"
import { createCheckoutPreference } from "@/lib/actions/checkout"

// Titulo/descripcion/imagen por curso: sin esto, compartir el link de un
// curso puntual (WhatsApp, LinkedIn, el propio programa de afiliados) mostraba
// siempre la misma preview generica de "UpgradeLab" para todos los cursos.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: course } = await supabase
    .from("courses")
    .select("title, description, cover_image_url, category")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!course) {
    return { title: "Curso no encontrado" }
  }

  const description =
    course.description?.trim() ||
    `${categoryLabel(course.category)} · Curso de UpgradeLab, disponible por compra individual o suscripcion.`
  const images = course.cover_image_url ? [{ url: course.cover_image_url }] : undefined

  return {
    title: course.title,
    description,
    openGraph: { title: course.title, description, images },
    twitter: { title: course.title, description, images },
  }
}

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

  // Si el usuario ya tiene acceso (compra aprobada de este curso, o
  // suscripcion activa), no tiene sentido ofrecerle "Comprar" de nuevo —
  // mismo criterio de acceso que en el dashboard y en el proxy de lectura.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasPurchase = false
  let hasActiveSubscription = false

  if (user) {
    const [{ data: purchase }, { data: subscription }] = await Promise.all([
      supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .eq("status", "approved")
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    hasPurchase = Boolean(purchase)
    hasActiveSubscription = subscription?.status === "active"
  }

  const hasAccess = hasPurchase || hasActiveSubscription

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
        {hasAccess ? (
          <>
            {hasPurchase ? (
              <a
                href={`/api/cursos/${slug}/leer`}
                className="block w-full rounded-md bg-neutral-900 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
              >
                Descargar PDF
              </a>
            ) : (
              <Link
                href={`/dashboard/leer/${slug}`}
                className="block w-full rounded-md bg-neutral-900 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
              >
                Leer curso
              </Link>
            )}
            <p className="mt-3 text-center text-sm text-neutral-500">
              Ya tenes acceso a este curso{hasPurchase ? "" : " por tu suscripcion"}.
            </p>
          </>
        ) : canBuyIndividual ? (
          <form action={createCheckoutPreference}>
            <input type="hidden" name="courseId" value={course.id} />
            <input type="hidden" name="slug" value={slug} />
            <label className="mb-3 flex items-start gap-2 text-xs text-neutral-500">
              <input type="checkbox" required className="mt-0.5" />
              <span>
                Es un producto digital de acceso inmediato: al acceder al contenido, pierdo el
                derecho de arrepentimiento (art. 1116 CCyC). Acepto los{" "}
                <Link href="/terminos" className="underline hover:text-neutral-900">
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/reembolsos" className="underline hover:text-neutral-900">
                  Política de Reembolsos
                </Link>
                .
              </span>
            </label>
            <button
              type="submit"
              className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Comprar — {formatPrice(course.price)}
            </button>
          </form>
        ) : (
          <>
            <Link
              href="/register"
              className="block w-full rounded-md bg-neutral-900 py-3 text-center text-sm font-medium text-white hover:bg-neutral-800"
            >
              Suscribite para acceder
            </Link>
            <p className="mt-3 text-center text-sm text-neutral-500">
              Este curso esta disponible solo por suscripcion mensual.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
