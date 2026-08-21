"use client"

import { useState } from "react"

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Si el navegador no permite clipboard (ej. sin HTTPS en local),
      // no rompemos nada, simplemente no se copia.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
    >
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  )
}
