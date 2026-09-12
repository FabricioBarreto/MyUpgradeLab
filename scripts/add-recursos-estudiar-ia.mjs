// Caso especial: estudiar-con-ia-notebooklm-claude-nano-banana no tiene un
// .html fuente (ver nota en docs/TASKS.md) — su content_html se reconstruyo
// en su momento extrayendo texto del PDF. No hay de donde regenerar el PDF
// ni el content_html completo, asi que esto solo agrega el capitulo de
// Recursos directamente sobre el content_html ya existente en Supabase, con
// el mismo estilo <h2> que ya usa el resto del contenido de este curso.
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const slug = "estudiar-con-ia-notebooklm-claude-nano-banana"

const { data, error: fetchError } = await supabase
  .from("courses")
  .select("content_html")
  .eq("slug", slug)
  .single()

if (fetchError || !data) {
  console.error("Error leyendo el curso:", fetchError?.message)
  process.exit(1)
}

const marker = '<p class="label">UPGRADELAB</p>'
if (!data.content_html.includes(marker)) {
  console.error("No encontre el marcador esperado, revisar a mano")
  process.exit(1)
}
if (data.content_html.includes("Recursos")) {
  console.log("Ya tiene una seccion de Recursos, no se toca de nuevo.")
  process.exit(0)
}

const recursos = `<h2>08 · Recursos</h2>
<p>Links directos a las herramientas de esta guía.</p>
<ul>
<li><strong>NotebookLM</strong> — <a href="https://notebooklm.google.com" target="_blank" rel="noopener noreferrer">notebooklm.google.com</a></li>
<li><strong>Claude</strong> — <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">claude.ai</a></li>
<li><strong>Nano Banana (Gemini)</strong> — <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer">gemini.google.com</a></li>
</ul>
`

const newHtml = data.content_html.replace(marker, `${recursos}\n${marker}`)

const { error: updateError } = await supabase
  .from("courses")
  .update({ content_html: newHtml })
  .eq("slug", slug)

if (updateError) {
  console.error("Error actualizando:", updateError.message)
  process.exit(1)
}

console.log("✅ Recursos agregado a", slug)
console.log("Nota: este curso no tiene .html fuente, asi que el PDF NO se actualizo — solo la vista de lectura por suscripcion tiene el capitulo nuevo.")
