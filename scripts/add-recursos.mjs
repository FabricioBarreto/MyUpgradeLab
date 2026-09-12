import { readFileSync, writeFileSync } from "fs"

const courses = [
  {
    file: "cursos/programacion-ia/nivel-1-fundamentos.html",
    label: "Recursos — links directos a las herramientas de esta guía",
    lead: "Links directos a las herramientas mencionadas en esta guía.",
    links: [
      ["Bolt.new", "https://bolt.new"],
      ["Lovable", "https://lovable.dev"],
      ["Replit", "https://replit.com"],
      ["v0 (Vercel)", "https://v0.dev"],
    ],
  },
  {
    file: "cursos/programacion-ia/nivel-2-flujos-de-trabajo.html",
    label: "Recursos — links directos a las herramientas de esta guía",
    lead: "Links directos a las herramientas mencionadas en esta guía.",
    links: [
      ["GitHub Copilot", "https://github.com/features/copilot"],
      ["Cursor", "https://cursor.com"],
      ["Claude Code", "https://claude.com/product/claude-code"],
    ],
  },
  {
    file: "cursos/programacion-ia/nivel-3-proyectos-completos.html",
    label: "Recursos — plataformas de deploy mencionadas en esta guía",
    lead: "Links directos a las plataformas de deploy mencionadas en esta guía.",
    links: [
      ["Vercel", "https://vercel.com"],
      ["Netlify", "https://www.netlify.com"],
      ["Railway", "https://railway.com"],
    ],
  },
  {
    file: "cursos/programacion-ia/automatizacion-n8n-make.html",
    label: "Recursos — links directos a las herramientas de esta guía",
    lead: "Links directos a las herramientas mencionadas en esta guía.",
    links: [
      ["n8n", "https://n8n.io"],
      ["Make", "https://www.make.com"],
      ["WhatsApp Business Platform", "https://business.whatsapp.com"],
      ["Twilio", "https://www.twilio.com"],
      ["OpenAI", "https://openai.com"],
      ["Claude", "https://claude.ai"],
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
