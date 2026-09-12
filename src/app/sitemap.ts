import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import { getAppUrl } from "@/lib/constants"

// Sitemap dinamico (09/09/2026, ver docs/TASKS.md): combina las paginas
// publicas estaticas con una entrada por cada curso activo (mismo filtro
// is_active = true que usa /cursos, de lectura publica por RLS). Se genera
// en cada request de un crawler en vez de a build time, para que un curso
// nuevo o dado de baja aparezca/desaparezca sin necesitar redeploy.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppUrl() || "https://my-upgrade-lab.vercel.app"
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from("courses")
    .select("slug, updated_at")
    .eq("is_active", true)

  const courseEntries: MetadataRoute.Sitemap = (courses ?? []).map((course) => ({
    url: `${baseUrl}/cursos/${course.slug}`,
    lastModified: course.updated_at ? new Date(course.updated_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/cursos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/afiliados`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/cookies`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/reembolsos`, changeFrequency: "yearly", priority: 0.2 },
  ]

  return [...staticEntries, ...courseEntries]
}
