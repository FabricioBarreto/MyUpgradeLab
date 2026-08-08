"use client"

import { useEffect, useRef } from "react"
import { trackEvent } from "@/lib/gtag"

// Dispara un evento GA4 una sola vez al montar (pensado para paginas de
// confirmacion: /checkout/success). El ref evita un doble disparo si el
// componente se vuelve a montar (p.ej. React StrictMode en desarrollo).
export function TrackConversion({
  eventName,
  eventParams,
}: {
  eventName: string
  eventParams?: Record<string, unknown>
}) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    trackEvent(eventName, eventParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
