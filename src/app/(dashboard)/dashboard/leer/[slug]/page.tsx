import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { addChapterIds } from "@/lib/toc"
import { ChapterNav } from "@/components/chapter-nav"
import { ReadingProgress } from "@/components/reading-progress"

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
    .select("id, title, content_html, resource_url")
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
      <div className="flex h-screen flex-col">
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

  const hasAccess = Boolean(purchase) || subscription?.status === "active"

  if (!hasAccess) {
    redirect(`/cursos/${slug}?error=${encodeURIComponent("No tenes acceso a este curso todavia")}`)
  }

  // Capitulos (h2) para la tabla de contenidos de la barra lateral — se les
  // inyecta un id al propio HTML para poder hacer scroll-to-anchor.
  const { html: contentHtml, chapters } = addChapterIds(course.content_html)

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />

      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Volver al dashboard
        </Link>
        <span className="text-xs text-neutral-400">{user.email}</span>
      </div>

      <div className="mx-auto flex max-w-5xl gap-12 px-6 py-10 sm:py-14">
        <ChapterNav chapters={chapters} />

        <article className="course-article min-w-0 max-w-2xl flex-1">
          <h1 className="mb-8 text-2xl font-semibold text-neutral-900 sm:text-3xl">{course.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />

          <p className="mt-16 border-t border-neutral-100 pt-6 text-center text-xs text-neutral-300">
            UpgradeLab · acceso de {user.email} · uso personal, no redistribuible
          </p>
        </article>
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
