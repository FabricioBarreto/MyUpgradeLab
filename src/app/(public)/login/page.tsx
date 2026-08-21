import Link from "next/link"
import { signIn } from "@/lib/actions/auth"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; redirect?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-neutral-900">Iniciar sesion</h1>
          <p className="text-sm text-neutral-500">Entra a tu cuenta de UpgradeLab</p>
        </div>

        {params.message && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {params.message}
          </p>
        )}
        {params.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </p>
        )}

        <form action={signIn} className="space-y-4">
          {params.redirect && <input type="hidden" name="redirect" value={params.redirect} />}
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:underline">
                Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          No tenes cuenta?{" "}
          <Link
            href={params.redirect === "/dashboard/afiliados" ? "/register?intent=affiliate" : "/register"}
            className="font-medium text-neutral-900 hover:underline"
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
