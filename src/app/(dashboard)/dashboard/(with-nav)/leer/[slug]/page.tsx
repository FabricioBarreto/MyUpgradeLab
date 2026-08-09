import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { addChapterIds } from "@/lib/toc"
import { ChapterNav } from "@/components/chapter-nav"
import { ReadingProgress } from "@/components/reading-progress"
import { CourseSidebar } from "@/components/course-sidebar"
import { COMMUNITY_LINKS } from "@/lib/community"

// Pagina "lectora". Desde 08/08/2026 el acceso por suscripcion ya no muestra
// el PDF (ni siquiera embebido): si el curso tiene `content_html` cargado,
// se renderiza como articulo dentro de nuestra propia UI, sin invitar a
// descargar ni guardar un archivo — la idea de negocio es que el acceso dura
// mientras la suscripcion este activa, no que la persona se quede con una
// copia. El chequeo de acceso (compra aprobada o suscripcion activa) se hace
// aca mismo, en el server component, en vez de depender de un iframe a un
// proxy aparte.
//
// Si el curso todavia no tiene `content_html` cargado (migracion en curso de
// los cursos viejos), se cae al iframe de PDF de siempre via
// /api/cursos/[slug]/leer, que ya hace su propio chequeo de acceso.
//
// Vive dentro de (with-nav) a proposito (08/08/2026): al principio estaba
// fuera del grupo para una lectura "sin distracciones", pero eso tambien
// dejaba a la pagina sin logo ni navbar — se movio para adentro y ahora
// comparte el header de siempre (logo, menu, cerrar sesion).
export default async function LeerCursoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/dashboard/leer/${slug}`)}`)
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, content_html, resource_url, category, access_type")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!course) {
    notFound()
  }

  // Sin content_html: mismo comportamiento de siempre (iframe al PDF, el
  // proxy hace el chequeo de acceso por su cuenta).
  if (!course.content_html) {
    return (
      <div className="flex h-[calc(100vh-65px)] flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
          <div>
            <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900">
              ← Volver al dashboard
            </Link>
            <p className="mt-0.5 text-sm font-medium text-neutral-900">{course.title}</p>
          </div>
        </div>
        <iframe
          src={`/api/cursos/${slug}/leer`}
          className="flex-1 border-0"
          title={course.title}
        />
      </div>
    )
  }

  // Con content_html: chequeo de acceso propio (compra aprobada de este
  // curso, o suscripcion activa) — mismo criterio que en el resto de la app.
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

  const isSubscribed = subscription?.status === "active"
  const hasAccess = Boolean(purchase) || isSubscribed

  if (!hasAccess) {
    redirect(`/cursos/${slug}?error=${encodeURIComponent("No tenes acceso a este curso todavia")}`)
  }

  // Capitulos (h2) para la tabla de contenidos de la barra lateral — se les
  // inyecta un id al propio HTML para poder hacer scroll-to-anchor.
  const { html: contentHtml, chapters } = addChapterIds(course.content_html)

  // Categorias a las que el usuario tiene acceso (mismo criterio que en el
  // dashboard): todas si esta suscripto, o las de sus compras aprobadas si
  // no. Se usa para no ofrecer, en "Segui explorando", cursos a los que en
  // realidad no puede entrar todavia.
  const accessibleCategories: Set<string> | null = isSubscribed ? null : new Set<string>()
  if (!isSubscribed) {
    const { data: allPurchases } = await supabase
      .from("purchases")
      .select("*, courses(*)")
      .eq("user_id", user.id)
      .eq("status", "approved")

    for (const p of allPurchases ?? []) {
      const category = (p.courses as { category: string | null } | null)?.category
      if (category) accessibleCategories!.add(category)
    }
  }

  // Cursos relacionados para la barra lateral: primero de la misma
  // categoria, completando con otras categorias accesibles si faltan.
  type RelatedCourse = { slug: string; title: string; category: string | null }
  let relatedCourses: RelatedCourse[] = []

  if (course.category) {
    const { data: sameCategory } = await supabase
      .from("courses")
      .select("slug, title, category")
      .eq("is_active", true)
      .eq("category", course.category)
      .neq("id", course.id)
      .limit(6)

    relatedCourses = (sameCategory ?? []).filter(
      (c) => isSubscribed || accessibleCategories?.has(c.category ?? "")
    )
  }

  if (relatedCourses.length < 3) {
    const { data: otherCourses } = await supabase
      .from("courses")
      .select("slug, title, category")
      .eq("is_active", true)
      .neq("id", course.id)
      .limit(12)

    const extra = (otherCourses ?? [])
      .filter((c) => c.category !== course.category)
      .filter((c) => isSubscribed || accessibleCategories?.has(c.category ?? ""))

    relatedCourses = [...relatedCourses, ...extra]
  }
  relatedCourses = relatedCourses.slice(0, 3)

  const communityUrl = course.category ? COMMUNITY_LINKS[course.category] : undefined
  const showSubscribeUpsell = !isSubscribed && relatedCourses.length === 0

  return (
    <div className="bg-white">
      <ReadingProgress />

      <div className="mx-auto flex max-w-7xl gap-10 px-6 py-10 sm:py-14">
        <ChapterNav chapters={chapters} />

        <article className="course-article min-w-0 max-w-3xl flex-1">
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← Volver al dashboard
          </Link>
          <h1 className="mb-8 mt-3 text-2xl font-semibold text-neutral-900 sm:text-3xl">{course.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />

          {relatedCourses.length > 0 && (
            <div className="mt-16 border-t border-neutral-100 pt-8 lg:hidden">
              <p className="text-sm font-medium text-neutral-900">Segui explorando</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {relatedCourses.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/dashboard/leer/${related.slug}`}
                    className="rounded-lg border border-neutral-200 p-3 text-sm text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900"
                  >
                    {related.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <p className="mt-16 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-300">
            UpgradeLab · acceso de {user.email} · uso personal, no redistribuible
          </p>
        </article>

        <CourseSidebar
          category={course.category}
          accessType={course.access_type}
          communityUrl={communityUrl}
          relatedCourses={relatedCourses}
          showSubscribeUpsell={showSubscribeUpsell}
        />
      </div>

      {/* Deterrente liviano contra copia casual: bloquea el menu contextual
          (click derecho) en el area de lectura. No impide seleccionar texto
          (muchos cursos tienen codigo pensado para copiar y usar) ni es a
          prueba de alguien decidido — el control real de acceso es que la
          pagina exige sesion + suscripcion activa en cada carga. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.querySelector('.course-article')?.addEventListener('contextmenu', function(e){ e.preventDefault(); });`,
        }}
      />
    </div>
  )
}
