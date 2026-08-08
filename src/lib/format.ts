export const CATEGORY_LABELS: Record<string, string> = {
  programacion_ia: "Programacion / IA",
  estudio_ia: "Estudio con IA",
  ingles: "Ingles",
  entrevistas: "Entrevistas de trabajo",
  ventas_freelance: "Negocio para freelancers y devs",
}

export function categoryLabel(category: string | null): string {
  if (!category) return "General"
  return CATEGORY_LABELS[category] ?? category
}

// Colores de pill por categoria, solo para diferenciar visualmente tarjetas
// de curso en el dashboard/catalogo (no tiene ningun significado de negocio).
const CATEGORY_COLORS: Record<string, string> = {
  programacion_ia: "bg-blue-50 text-blue-700",
  estudio_ia: "bg-purple-50 text-purple-700",
  ingles: "bg-amber-50 text-amber-700",
  entrevistas: "bg-rose-50 text-rose-700",
  ventas_freelance: "bg-teal-50 text-teal-700",
}

export function categoryBadgeClass(category: string | null): string {
  if (!category) return "bg-neutral-100 text-neutral-600"
  return CATEGORY_COLORS[category] ?? "bg-neutral-100 text-neutral-600"
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price)
}

export const ACCESS_TYPE_LABELS: Record<string, string> = {
  individual: "Compra individual",
  subscription_only: "Solo suscripcion",
  both: "Individual o suscripcion",
}

export function accessTypeLabel(accessType: string | null): string {
  if (!accessType) return ""
  return ACCESS_TYPE_LABELS[accessType] ?? accessType
}
