import { readFileSync, writeFileSync, existsSync } from "fs"
import { v2 as cloudinary } from "cloudinary"
import { createClient } from "@supabase/supabase-js"
import sanitizeHtml from "sanitize-html"
import puppeteer from "puppeteer"
import * as cheerio from "cheerio"

// ---------- args ----------
const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const [category, slug] = args.filter((a) => !a.startsWith("--"))

if (!category || !slug) {
  console.error("Uso: node scripts/publish-course.mjs <categoria> <slug> [--dry-run]")
  process.exit(1)
}

const baseDir = `cursos/${category}`
const htmlPath = `${baseDir}/${slug}.html`
const jsonPath = `${baseDir}/${slug}.json`
const pdfPath = `${baseDir}/${slug}.pdf`
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

console.log(`\n=== Publicando "${meta.title}" (${category}/${slug}) ${dryRun ? "[DRY RUN]" : ""} ===\n`)

// ---------- Paso 1: HTML -> PDF con Puppeteer ----------
console.log("[1/5] Generando PDF...")
const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.goto(`file://${process.cwd()}/${htmlPath}`, { waitUntil: "networkidle0" })
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
})
await browser.close()
console.log(`      OK -> ${pdfPath}`)

// ---------- Paso 2: transformar el .html de impresion a HTML de lectura ----------
// Calibrado contra cursos/programacion-ia/nivel-1-fundamentos.html (22/08/2026):
// - saca portada (.cover) e indice impreso (.toc), la web arma su propia TOC
// - convierte el h1 de cada .chapter a h2 (src/lib/toc.ts busca h2 para el TOC)
// - convierte <dl>/<dt>/<dd> (glosario) a <ul><li><strong>termino</strong> — definicion</li></ul>,
//   porque dl/dt/dd no estan en la whitelist del sanitizador
// - convierte .prompt a <pre><code> (ya tiene estilo propio en globals.css)
// - convierte .box y .callout-warning a <blockquote> (con el label en <strong>)
// - convierte .flow-step a <ol><li><strong>titulo</strong> descripcion</li></ol>
function stripPrintMarkup(html) {
  const $ = cheerio.load(html)

  $(".cover").remove()
  $(".toc").remove()

  $(".chapter").each((_, el) => {
    const $chapter = $(el)
    const h1 = $chapter.children("h1").first()
    if (h1.length) {
      h1.replaceWith(`<h2>${h1.html()}</h2>`)
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

  $(".flow-step").each((_, el) => {
    const $el = $(el)
    const title = $el.find("h3").first().html()
    $el.find("h3").first().remove()
    const rest = $el.find(".flow-body").html() || ""
    $el.replaceWith(`<li><strong>${title}</strong> ${rest}</li>`)
  })
  // Envolver los <li> sueltos que dejaron los flow-step en un <ol>
  $("body").each((_, body) => {
    const $body = $(body)
    const loose = $body.children("li")
    if (loose.length) {
      const $ol = $("<ol></ol>")
      loose.each((_, li) => $ol.append(li))
      $body.prepend($ol)
    }
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
console.log("[2/5] content_html generado y sanitizado")

if (dryRun) {
  writeFileSync(previewPath, contentHtml, "utf-8")
  console.log(`\n🔍 DRY RUN: nada se subio a Cloudinary ni a Supabase.`)
  console.log(`   Revisa el resultado en: ${previewPath}`)
  console.log(`   (abrilo en el navegador para ver como va a quedar)\n`)
  process.exit(0)
}

// ---------- Paso 3: subir PDF a Cloudinary y convertir a authenticated ----------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log("[3/5] Subiendo a Cloudinary...")
const uploadResult = await cloudinary.uploader.upload(pdfPath, {
  resource_type: "raw",
  folder: "courses",
  public_id: slug,
})

console.log("[4/5] Convirtiendo a authenticated...")
await cloudinary.uploader.rename(uploadResult.public_id, uploadResult.public_id, {
  resource_type: "raw",
  to_type: "authenticated",
  invalidate: true,
})
const resourceUrl = uploadResult.secure_url
console.log(`      OK -> ${resourceUrl}`)

// ---------- Paso 5: insertar en Supabase ----------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log("[5/5] Cargando curso en Supabase...")
const { error } = await supabase.from("courses").insert({
  title: meta.title,
  slug,
  description: meta.description,
  category: category.replace(/-/g, "_"),
  price: meta.price,
  access_type: meta.accessType,
  resource_url: resourceUrl,
  content_html: contentHtml,
})

if (error) {
  console.error("ERROR insertando en Supabase:", error.message)
  process.exit(1)
}

console.log(`\n✅ Curso publicado: ${meta.title}`)
console.log(`   Verificar en /cursos/${slug} y /dashboard/leer/${slug}\n`)
