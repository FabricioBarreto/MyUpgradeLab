import Link from "next/link"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-neutral-900">
            UpgradeLab
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-neutral-600">
            <Link href="/" className="hover:text-neutral-900">
              Inicio
            </Link>
            <Link href="/cursos" className="hover:text-neutral-900">
              Cursos
            </Link>
            <Link href="/sugerencias" className="hover:text-neutral-900">
              Sugerencias
            </Link>
            <Link href="/login" className="hover:text-neutral-900">
              Ingresar
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800"
            >
              Registrarse
            </Link>
          </nav>
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
          <Link href="/dashboard/afiliados" className="hover:text-neutral-900">
            Afiliados
          </Link>
        </nav>
        <p className="mt-4">UpgradeLab — {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
