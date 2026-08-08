// Helper minimo para mandar eventos custom a GA4 desde el cliente. Si GA no
// esta cargado (falta NEXT_PUBLIC_GA_ID, o el script todavia no corrio) no
// rompe nada, simplemente no manda el evento.
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return
  window.gtag("event", name, params)
}
