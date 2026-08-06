import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions/auth"

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cursos", label: "Catálogo" },
  { href: "/dashboard/afiliados", label: "Afiliados" },
  { href: "/sugerencias", label: "Sugerencias" },
]

export default async function DashboardWithNavLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="shrink-0 text-lg font-semibold text-neutral-900">
            Upgrade<span className="text-teal-600">Lab</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-neutral-900">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <span className="max-w-[180px] truncate text-sm text-neutral-500">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>

          {/* Menu mobile: <details> nativo, sin JS, para que sea responsive
              sin convertir el layout en Client Component. */}
          <details className="relative md:hidden">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-md border border-neutral-300 text-neutral-700 [&::-webkit-details-marker]:hidden">
              <span className="sr-only">Menu</span>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </summary>
            <div className="absolute right-0 z-30 mt-2 w-60 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
              <nav className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-2 border-t border-neutral-100 pt-2">
                <p className="truncate px-3 py-1 text-xs text-neutral-400">{user.email}</p>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cerrar sesión
                  </button>
                </form>
              </div>
            </div>
          </details>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
