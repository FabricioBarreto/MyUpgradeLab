// Variante de publish-course.mjs SIN el paso de PDF (Puppeteer no puede
// correr en este entorno: faltan librerias del sistema y no hay permisos
// para instalarlas). Actualiza solo `content_html` en Supabase, dejando
// `resource_url` (el PDF ya subido) intacto. El PDF se tiene que regenerar
// aparte, corriendo `publish-course.mjs <categoria> <slug> --update` desde
// una maquina con Chrome disponible.
import { readFileSync, writeFileSync, existsSync } from "fs"
import { createClient } from "@supabase/supabase-js"
import sanitizeHtml from "sanitize-html"
import * as cheerio from "cheerio"

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const [category, slug] = args.filter((a) => !a.startsWith("--"))

if (!category || !slug) {
  console.error("Uso: node scripts/update-content-html-only.mjs <categoria> <slug> [--dry-run]")
  process.exit(1)
}

const baseDir = `cursos/${category}`
const htmlPath = `${baseDir}/${slug}.html`
const jsonPath = `${baseDir}/${slug}.json`
const previewPath = `${baseDir}/${slug}.content-preview.html`

if (!existsSync(htmlPath)) {
  console.error(`No existe ${htmlPath}`)
  process.exit(1)
}
if (!existsSync(jsonPath)) {
  console.error(`No existe ${jsonPath} (metadata del curso)`)
  process.exit(1)
}

const meta = JSON.parse(readFileSync(jsonPath, "utf-8"))
const rawHtml = readFileSync(htmlPath, "utf-8")
const dbSlug = meta.slug || slug

console.log(`\n=== Actualizando SOLO content_html de "${meta.title}" (${category}/${slug}) ${dryRun ? "[DRY RUN]" : ""} ===\n`)

function stripPrintMarkup(html) {
  const $ = cheerio.load(html)
  $(".cover").remove()
  $(".toc").remove()

  $(".chapter").each((_, chapterEl) => {
    const $chapter = $(chapterEl)
    const h1 = $chapter.children("h1").first()
    if (h1.length) h1.replaceWith(`<h2>${h1.html()}</h2>`)

    const $flowSteps = $chapter.find(".flow-step")
    if ($flowSteps.length) {
      const $ol = $("<ol></ol>")
      $flowSteps.each((_, stepEl) => {
        const $step = $(stepEl)
        const title = ($step.find("h3").first().html() || "").trim()
        $step.find("h3").first().remove()
        const rest = ($step.find(".flow-body").html() || "").trim()
        $ol.append(`<li><strong>${title}</strong> ${rest}</li>`)
      })
      $flowSteps.first().before($ol)
      $flowSteps.remove()
    }
  })

  $("dl").each((_, dl) => {
    const $dl = $(dl)
    const $ul = $("<ul></ul>")
    $dl.children("dt").each((_, dt) => {
      const $dt = $(dt)
      const $dd = $dt.next("dd")
      const term = $dt.html()
      const def = $dd.length ? $dd.html() : ""
      $ul.append(`<li><strong>${term}</strong> — ${def}</li>`)
    })
    $dl.replaceWith($ul)
  })

  $(".prompt").each((_, el) => {
    const $el = $(el)
    const label = $el.find(".prompt-label").text().trim()
    $el.find(".prompt-label").remove()
    const body = $el.html().trim()
    $el.replaceWith(`<pre><code>${label ? label + "\n" : ""}${body}</code></pre>`)
  })

  $(".box, .callout-warning").each((_, el) => {
    const $el = $(el)
    const label = $el.find(".box-label").text().trim()
    $el.find(".box-label").remove()
    const body = $el.html().trim()
    $el.replaceWith(`<blockquote>${label ? `<strong>${label}</strong><br>` : ""}${body}</blockquote>`)
  })

  return $("body").html()
}

const cleanHtml = stripPrintMarkup(rawHtml)
const contentHtml = sanitizeHtml(cleanHtml, {
  allowedTags: [
    "h1", "h2", "h3", "h4",
    "p", "br", "strong", "em", "b", "i", "u", "a",
    "ul", "ol", "li",
    "table", "thead", "tbody", "tr", "th", "td",
    "pre", "code", "blockquote", "hr", "img",
  ],
  allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt"] },
  allowedSchemes: ["http", "https", "mailto"],
})
console.log("content_html generado y sanitizado")

writeFileSync(previewPath, contentHtml, "utf-8")

if (dryRun) {
  console.log(`\n🔍 DRY RUN: nada se subio a Supabase.`)
  console.log(`   Revisa el resultado en: ${previewPath}\n`)
  process.exit(0)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log("Actualizando content_html en Supabase (PDF/resource_url queda igual que estaba)...")
const { error } = await supabase.from("courses").update({ content_html: contentHtml }).eq("slug", dbSlug)

if (error) {
  console.error("ERROR en Supabase:", error.message)
  process.exit(1)
}

console.log(`\n✅ content_html actualizado: ${meta.title}`)
console.log(`   PENDIENTE: correr "node --env-file=.env scripts/publish-course.mjs ${category} ${slug} --update" desde una maquina con Chrome para regenerar el PDF con los mismos cambios.\n`)
