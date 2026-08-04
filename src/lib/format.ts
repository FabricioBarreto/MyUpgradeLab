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
