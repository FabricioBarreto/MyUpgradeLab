"use client"

import { trackEvent } from "@/lib/gtag"

// Los botones de "Comprar"/"Suscribirme" viven dentro de un <form
// action={serverAction}>, asi que no podemos poner un onClick directo en la
// pagina (es un Server Component). Este wrapper cliente solo agrega el
// tracking en el click y deja que el submit del form siga su curso normal.
export function TrackedSubmitButton({
  children,
  className,
  eventName,
  eventParams,
}: {
  children: React.ReactNode
  className?: string
  eventName: string
  eventParams?: Record<string, unknown>
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={() => trackEvent(eventName, eventParams)}
    >
      {children}
    </button>
  )
}
