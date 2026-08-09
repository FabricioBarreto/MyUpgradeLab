import Link from "next/link"
import { categoryLabel, categoryBadgeClass, accessTypeLabel } from "@/lib/format"

type RelatedCourse = { slug: string; title: string; category: string | null }

// Barra lateral derecha de la pagina lectora: antes ese espacio en pantallas
// grandes quedaba vacio. Ademas de rellenar el hueco, suma valor real —
// contexto del curso, el link de comunidad de esa categoria (si existe), y
// otros cursos a los que el lector ya tiene acceso (o, si no tiene mas
// acceso, un empujon a suscribirse).
export function CourseSidebar({
  category,
  accessType,
  communityUrl,
  relatedCourses,
  showSubscribeUpsell,
}: {
  category: string | null
  accessType: string | null
  communityUrl?: string
  relatedCourses: RelatedCourse[]
  showSubscribeUpsell: boolean
}) {
  return (
    <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-64 shrink-0 space-y-6 overflow-y-auto pb-10 lg:block">
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${categoryBadgeClass(category)}`}
        >
          {categoryLabel(category)}
        </span>
        {accessType && (
          <p className="mt-2 text-xs text-neutral-500">{accessTypeLabel(accessType)}</p>
        )}
      </div>

      {communityUrl && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm font-medium text-neutral-900">Comunidad</p>
          <p className="mt-1 text-xs text-neutral-500">
            Sumate a la comunidad de WhatsApp para dudas e intercambio.
          </p>
          <a
            href={communityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-md bg-neutral-900 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-neutral-800"
          >
            Unirme
          </a>
        </div>
      )}

      {relatedCourses.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-sm font-medium text-neutral-900">Segui explorando</p>
          <ul className="mt-2 space-y-2">
            {relatedCourses.map((related) => (
              <li key={related.slug}>
                <Link
                  href={`/dashboard/leer/${related.slug}`}
                  className="block text-sm text-neutral-600 hover:text-neutral-900"
                >
                  {related.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showSubscribeUpsell && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-900 p-4">
          <p className="text-sm font-medium text-white">Acceso a todo el catalogo</p>
          <p className="mt-1 text-xs text-neutral-300">
            Con la suscripcion mensual accedes a todos los cursos, no solo a este.
          </p>
          <Link
            href="/dashboard"
            className="mt-3 block rounded-md bg-white px-3 py-1.5 text-center text-xs font-medium text-neutral-900 hover:bg-neutral-100"
          >
            Ver suscripcion
          </Link>
        </div>
      )}
    </aside>
  )
}
