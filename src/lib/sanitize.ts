import sanitizeHtml from 'sanitize-html'

// El contenido HTML de los cursos lo carga el admin a mano (pegado en el
// panel), no un usuario final — el riesgo de XSS es bajo, pero sanitizamos
// igual antes de guardarlo por las dudas (un copy-paste con un <script>
// perdido, una extension de browser que ensucia el HTML, etc.). Whitelist
// pensada para el tipo de contenido que generan las guias: texto, titulos,
// listas, tablas y bloques de codigo — nada de scripts, iframes ni estilos
// inline.
export function sanitizeCourseHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4',
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a',
      'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'pre', 'code', 'blockquote', 'hr', 'img',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
}
