// Sello de confianza chico, para poner pegado a cualquier boton de pago.
// Para alguien que nunca compro en el sitio, ver "pago seguro" + el medio de
// pago conocido (Mercado Pago) cerca del boton reduce friccion en el momento
// mas sensible del flujo — no cambia nada tecnico, es una señal de confianza.
export function PaymentBadge({ align = "center" }: { align?: "center" | "start" }) {
  return (
    <p
      className={`mt-3 flex items-center gap-1.5 text-xs text-neutral-400 ${
        align === "center" ? "justify-center" : "justify-start"
      }`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
        <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      Pago 100% seguro, procesado por Mercado Pago
    </p>
  )
}
