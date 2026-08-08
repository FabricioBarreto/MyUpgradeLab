"use client"

import { useEffect, useState } from "react"

// Barra fina fija arriba de todo que se va llenando con el scroll de la
// pagina. Feedback simple de "cuanto me falta" en cursos largos — antes no
// habia ninguna señal de progreso dentro de un curso.
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
      setProgress(pct)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <div className="fixed left-0 top-0 z-20 h-0.5 w-full bg-neutral-100">
      <div
        className="h-full bg-neutral-900 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
