import Link from "next/link"
import { submitArrepentimiento } from "@/lib/actions/legal"

export const metadata = {
  title: "Reembolsos y Botón de Arrepentimiento — UpgradeLab",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

export default async function ReembolsosPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>
}) {
  const { code, error } = await searchParams

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Volver al inicio
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-neutral-900">
        Reembolsos y Botón de Arrepentimiento
      </h1>
      <p className="mt-2 text-sm text-neutral-500">Última actualización: agosto de 2026.</p>

      <Section title="Derecho de arrepentimiento en compras a distancia">
        <p>
          La Ley 24.240 de Defensa del Consumidor te da derecho a arrepentirte de una compra hecha a
          distancia (como una compra online) dentro de los 10 días corridos desde que la
          confirmaste, sin costo ni necesidad de justificar el motivo.
        </p>
      </Section>

      <Section title="Excepción para contenido digital">
        <p>
          El Código Civil y Comercial (artículo 1.116) establece una excepción a ese derecho para
          archivos informáticos suministrados por vía electrónica cuando pueden descargarse o
          reproducirse de inmediato para uso permanente — que es exactamente lo que vendemos: PDFs
          de acceso inmediato.
        </p>
        <p>
          En la práctica: si comprás un curso y accedés o descargás el material, perdés el derecho
          de arrepentimiento sobre esa compra puntual, porque ya recibiste el producto completo. Te
          lo avisamos de forma expresa antes de confirmar cualquier compra, como exige la norma para
          que esta excepción aplique.
        </p>
        <p>
          Si todavía no accediste ni descargaste el contenido de un curso que compraste hace menos
          de 10 días, o si tenés un problema con tu suscripción, podés pedir la revocación con el
          formulario de abajo.
        </p>
        <p>
          Para resolver cada pedido de forma objetiva, nuestro sistema registra el momento exacto en
          que se accede por primera vez al contenido de una compra. Si el registro muestra que ya
          accediste, el pedido se rechaza con ese fundamento; si todavía no accediste, se resuelve a
          tu favor.
        </p>
      </Section>

      <Section title="Cómo se procesa tu pedido">
        <p>
          No hace falta que tengas una cuenta ni que inicies sesión para usar este formulario. Al
          enviarlo, te vamos a mostrar (y mandar por email) un código de identificación del pedido.
          Vamos a responderte dentro de los 5 días hábiles con la resolución.
        </p>
      </Section>

      <div className="mt-10 rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Pedir arrepentimiento / revocación</h2>

        {code && (
          <p className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
            Recibimos tu pedido. Tu código de identificación es <strong>{code}</strong> — guardalo
            para hacer seguimiento. También te lo mandamos por email si lo dejaste bien escrito.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <form action={submitArrepentimiento} className="mt-4 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email con el que compraste
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
              Nombre (opcional)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-neutral-700">
              Curso o suscripción a la que te referís
            </label>
            <input
              id="reference"
              name="reference"
              type="text"
              placeholder="Ej: Venta Consultiva / Discovery Calls"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-neutral-700">
              Contanos que paso (opcional)
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Enviar pedido
          </button>
        </form>
      </div>
    </div>
  )
}
