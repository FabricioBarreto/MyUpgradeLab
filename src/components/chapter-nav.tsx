"use client"

import { useEffect, useState } from "react"
import type { Chapter } from "@/lib/toc"

// Tabla de contenidos fija a la izquierda en pantallas grandes (antes ese
// espacio quedaba vacio). Resalta el capitulo que se esta leyendo usando
// IntersectionObserver sobre los headings reales del articulo.
export function ChapterNav({ chapters }: { chapters: Chapter[] }) {
  const [activeId, setActiveId] = useState<string | null>(chapters[0]?.id ?? null)

  useEffect(() => {
    if (chapters.length === 0) return

    const headings = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    )

    headings.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [chapters])

  if (chapters.length === 0) return null

  return (
    <nav
      aria-label="Tabla de contenidos"
      className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-56 shrink-0 overflow-y-auto pb-10 lg:block"
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-400">
        Contenido
      </p>
      <ul className="space-y-0.5 border-l border-neutral-200">
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              className={`-ml-px block border-l-2 py-1.5 pl-3 text-sm leading-snug transition-colors ${
                activeId === chapter.id
                  ? "border-neutral-900 font-medium text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {chapter.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
