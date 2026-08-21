"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// El link del email de Supabase trae el token de recuperacion en el hash de
// la URL (#access_token=...&type=recovery). El cliente de browser lo procesa
// solo al inicializar (detectSessionInUrl, activado por default) y dispara
// el evento PASSWORD_RECOVERY cuando la sesion de recuperacion queda lista.
// Por eso esta pagina es Client Component: no hay nada que un server
// component pueda leer de un fragmento de URL.
export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true)
      }
    })

    // Por si el evento ya se disparo antes de montar este listener.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push("/login?message=" + encodeURIComponent("Contraseña actualizada, ya podes iniciar sesion"))
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-sm space-y-3 rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900">Verificando el link</h1>
          <p className="text-sm text-neutral-500">
            Si tarda mas de unos segundos, es posible que el link haya expirado. Pedi uno nuevo desde{" "}
            <a href="/forgot-password" className="font-medium text-neutral-900 hover:underline">
              recuperar contraseña
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-neutral-900">Nueva contraseña</h1>
          <p className="text-sm text-neutral-500">Elegi tu nueva contraseña</p>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </div>
  )
}
