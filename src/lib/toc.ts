// Extrae los capitulos (h2) del content_html de un curso para armar la tabla
// de contenidos de la pagina lectora, y les inyecta un id en el propio HTML
// para poder hacer scroll-to-anchor. Los cursos ya vienen con h2 numerados
// ("01 - Introduccion", etc.) asi que el label sale tal cual del heading.
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g")

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export type Chapter = { id: string; label: string }

export function addChapterIds(html: string): { html: string; chapters: Chapter[] } {
  const chapters: Chapter[] = []
  const usedIds = new Set<string>()
  let index = 0

  const htmlWithIds = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_match, inner: string) => {
    index += 1
    const text = inner.replace(/<[^>]+>/g, "").trim()
    const base = slugify(text) || `capitulo-${index}`
    let id = base
    let n = 2
    while (usedIds.has(id)) {
      id = `${base}-${n}`
      n += 1
    }
    usedIds.add(id)
    chapters.push({ id, label: text })
    return `<h2 id="${id}">${inner}</h2>`
  })

  return { html: htmlWithIds, chapters }
}
