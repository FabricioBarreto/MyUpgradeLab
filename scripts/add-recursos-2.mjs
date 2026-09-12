import { readFileSync, writeFileSync } from "fs"

const courses = [
  {
    file: "cursos/ventas-freelance/marketing-herramientas-gratuitas.html",
    label: "Recursos — links directos a las herramientas de esta guía",
    lead: "Links directos a las herramientas mencionadas en esta guía.",
    links: [
      ["Canva", "https://www.canva.com"],
      ["Freepik AI", "https://www.freepik.com/ai"],
      ["Image Creator from Designer (antes Bing Image Creator)", "https://designer.microsoft.com"],
      ["CapCut", "https://www.capcut.com"],
      ["Metricool", "https://metricool.com"],
    ],
  },
  {
    file: "cursos/ventas-freelance/software-medida-ia-negocios.html",
    label: "Recursos — links directos a las herramientas de esta guía",
    lead: "Links directos a las herramientas de construcción mencionadas en esta guía (mismas de la serie Programar con IA, Nivel 1).",
    links: [
      ["Bolt.new", "https://bolt.new"],
      ["Lovable", "https://lovable.dev"],
      ["v0 (Vercel)", "https://v0.dev"],
    ],
  },
  {
    file: "cursos/entrevistas/entrevistas-trabajo-developers.html",
    label: "Recursos — para investigar el rango salarial antes de negociar",
    lead: "Fuentes para investigar el rango de mercado antes de la conversación de salario (capítulo 6).",
    links: [
      ["Sysarmy — Encuesta de sueldos IT Argentina", "https://sysarmy.com/blog"],
      ["Levels.fyi", "https://www.levels.fyi"],
      ["Glassdoor", "https://www.glassdoor.com"],
    ],
  },
  {
    file: "cursos/ingles/ingles-tecnico-developers.html",
    label: "Recursos — herramientas de IA para seguir practicando",
    lead: "Herramientas de IA conversacional para seguir practicando el prompt del capítulo 8.",
    links: [
      ["Claude", "https://claude.ai"],
      ["ChatGPT", "https://chatgpt.com"],
    ],
  },
]

for (const course of courses) {
  let html = readFileSync(course.file, "utf-8")

  const tocItemRegex = /<div class="toc-item"><span><span class="num">(\d+)<\/span>[^<]*<\/span><\/div>\n/g
  let lastNum = 0, insertAt = -1, m
  while ((m = tocItemRegex.exec(html)) !== null) {
    lastNum = parseInt(m[1], 10)
    insertAt = tocItemRegex.lastIndex
  }

  if (insertAt === -1) {
    console.error(`SKIP ${course.file}: no encontre toc-items, revisar a mano`)
    continue
  }

  const nextNum = String(lastNum + 1).padStart(2, "0")
  const newTocItem = `  <div class="toc-item"><span><span class="num">${nextNum}</span>${course.label}</span></div>\n`
  html = html.slice(0, insertAt) + newTocItem + html.slice(insertAt)

  const linksHtml = course.links
    .map(([name, url]) => `    <li><strong>${name}</strong> — <a href="${url}" target="_blank" rel="noopener noreferrer">${url.replace(/^https?:\/\//, "")}</a></li>`)
    .join("\n")

  const chapterBlock = `
<div class="chapter">
  <h1>${nextNum} · Recursos</h1>
  <p class="lead">${course.lead}</p>
  <ul>
${linksHtml}
  </ul>
</div>

`

  if (!html.includes("</body>")) {
    console.error(`SKIP ${course.file}: no encontre </body>, revisar a mano`)
    continue
  }
  html = html.replace("</body>", `${chapterBlock}</body>`)

  writeFileSync(course.file, html, "utf-8")
  console.log(`OK -> ${course.file} (capitulo ${nextNum} agregado)`)
}
