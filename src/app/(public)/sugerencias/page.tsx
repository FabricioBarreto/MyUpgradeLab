import { createClient } from "@/lib/supabase/server"
import { createSuggestion } from "@/lib/actions/suggestions"

export default async function SugerenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const { error, success } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">Sugerencias</h1>
      <p className="mt-2 text-neutral-600">
        Que curso te gustaria que hagamos? Que le cambiarias a la plataforma? Contanos, leemos todo.
      </p>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="mt-6 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Gracias! Ya la recibimos.
        </p>
      )}

      <form action={createSuggestion} className="mt-8 space-y-4">
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
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email (opcional, por si queremos responderte)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={user?.email ?? ""}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-700">
            Tu sugerencia
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Enviar sugerencia
        </button>
      </form>
    </div>
  )
}
