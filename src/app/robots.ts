import type { MetadataRoute } from "next"
import { getAppUrl } from "@/lib/constants"

// robots.txt (09/09/2026, ver docs/TASKS.md). Bloquea las zonas privadas
// (dashboard, admin, checkout, auth, api) de la indexacion — no tiene
// sentido en resultados de busqueda y algunas exponen tokens en la query
// string (ej. /auth/confirm?token_hash=...). El resto del sitio queda
// abierto y apunta al sitemap dinamico.
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrl() || "https://my-upgrade-lab.vercel.app"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/api",
          "/auth",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/checkout",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
