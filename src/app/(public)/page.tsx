import Link from "next/link"
import { CATEGORY_LABELS } from "@/lib/format"

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  programacion_ia: "Programacion practica e inteligencia artificial aplicada.",
  estudio_ia: "Tecnicas de estudio potenciadas con herramientas de IA.",
  ingles: "Ingles enfocado en uso real, sin relleno.",
  entrevistas: "Preparacion para entrevistas de trabajo.",
  ventas_freelance: "Ventas, marketing y herramientas para crecer como freelancer.",
}

export default function LandingPage() {
  return (
    <div>
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
          Aprende mas rapido, con recursos que van al grano
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">
          Cursos y recursos de programacion con IA, tecnicas de estudio, ingles, entrevistas de
          trabajo y negocio para freelancers. Comprá lo que necesitás una vez, o suscribite y accedé a todo.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/cursos"
            className="rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Ver cursos
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-2xl font-semibold text-neutral-900">Categorias</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Link
                key={key}
                href={`/cursos?categoria=${key}`}
                className="rounded-lg border border-neutral-200 p-6 transition-colors hover:border-neutral-400"
              >
                <h3 className="font-medium text-neutral-900">{label}</h3>
                <p className="mt-2 text-sm text-neutral-500">{CATEGORY_DESCRIPTIONS[key]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-neutral-900">Dos formas de acceder</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-left">
              <h3 className="font-medium text-neutral-900">Compra individual</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Pagá una sola vez por el curso o PDF que te interesa, sin suscripcion.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-6 text-left">
              <h3 className="font-medium text-neutral-900">Suscripcion mensual</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Acceso completo a todo el catalogo, sin descargar, con contenido actualizado.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
