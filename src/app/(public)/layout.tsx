import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/actions/auth"

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/cursos", label: "Cursos" },
  { href: "/afiliados", label: "Afiliados" },
  { href: "/sugerencias", label: "Sugerencias" },
]

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // El header cambia segun si hay sesion o no: alguien logueado no deberia
  // seguir viendo "Ingresar"/"Registrarse" (confunde, y hasta pisa la pagina
  // de compra si vuelve a registrarse) — le mostramos "Dashboard" y "Cerrar
  // sesion" en su lugar.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold text-neutral-900">
            <Image src="/logo-upgradelab.svg" alt="" width={28} height={28} className="rounded-md" />
            Upgrade<span className="text-teal-600">Lab</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 md:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-neutral-900">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                  Dashboard
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cerrar sesión
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Menu mobile: <details> nativo, sin JS. */}
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
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Dashboard
                    </Link>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                      >
                        Cerrar sesión
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Ingresar
                    </Link>
                    <Link
                      href="/register"
                      className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          </details>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-neutral-200 bg-white py-8 text-center text-sm text-neutral-500">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4">
          <Link href="/terminos" className="hover:text-neutral-900">
            Términos y Condiciones
          </Link>
          <Link href="/privacidad" className="hover:text-neutral-900">
            Privacidad
          </Link>
          <Link href="/cookies" className="hover:text-neutral-900">
            Cookies
          </Link>
          <Link href="/reembolsos" className="font-medium hover:text-neutral-900">
            Botón de Arrepentimiento
          </Link>
          <Link href="/afiliados" className="hover:text-neutral-900">
            Afiliados
          </Link>
        </nav>
        <p className="mt-4">UpgradeLab — {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
