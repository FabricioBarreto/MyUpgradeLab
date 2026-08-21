import Link from "next/link"
import { requestPasswordReset } from "@/lib/actions/auth"

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-neutral-900">Recuperar contraseña</h1>
          <p className="text-sm text-neutral-500">Te mandamos un link para restablecerla</p>
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

        <form action={requestPasswordReset} className="space-y-4">
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
          <button
            type="submit"
            className="w-full rounded-md bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Enviar link
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          <Link href="/login" className="font-medium text-neutral-900 hover:underline">
            Volver a iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  )
}
