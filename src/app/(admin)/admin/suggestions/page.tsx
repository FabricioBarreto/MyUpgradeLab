import { createClient } from "@/lib/supabase/server"
import { markSuggestionReviewed } from "@/lib/actions/suggestions"

export default async function AdminSuggestionsPage() {
  const supabase = await createClient()
  const { data: suggestions } = await supabase
    .from("suggestions")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-neutral-900">Sugerencias</h1>

      <div className="space-y-3">
        {suggestions?.map((s) => (
          <div key={s.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-900">
                {s.name ?? "Anonimo"} {s.email ? `(${s.email})` : ""}
              </span>
              <span
                className={
                  s.status === "new"
                    ? "rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700"
                    : "rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-500"
                }
              >
                {s.status}
              </span>
            </div>
            <p className="text-sm text-neutral-600">{s.message}</p>
            {s.status === "new" && (
              <form action={markSuggestionReviewed} className="mt-3">
                <input type="hidden" name="id" value={s.id} />
                <button type="submit" className="text-sm text-neutral-600 hover:text-neutral-900 hover:underline">
                  Marcar como revisada
                </button>
              </form>
            )}
          </div>
        ))}
        {(!suggestions || suggestions.length === 0) && (
          <p className="text-center text-neutral-400">No hay sugerencias todavia</p>
        )}
      </div>
    </div>
  )
}
