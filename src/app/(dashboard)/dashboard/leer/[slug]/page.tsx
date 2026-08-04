import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

// Pagina "lectora": embebe el PDF en un iframe dentro de nuestra propia UI
// en vez de navegar directo al archivo. Navegar directo a una URL de PDF
// dispara una descarga automatica en muchos navegadores segun su
// configuracion (ignorando el header Content-Disposition: inline), asi que
// para el acceso por suscripcion (que no deberia invitar a guardar el
// archivo) lo mostramos embebido aca. El chequeo real de acceso lo hace
// igual /api/cursos/[slug]/leer en cada carga del iframe.
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
    .select("title")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <div>
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← Volver al dashboard
          </Link>
          {course?.title && (
            <p className="mt-0.5 text-sm font-medium text-neutral-900">{course.title}</p>
          )}
        </div>
      </div>
      <iframe
        src={`/api/cursos/${slug}/leer`}
        className="flex-1 border-0"
        title={course?.title ?? "Curso"}
      />
    </div>
  )
}
