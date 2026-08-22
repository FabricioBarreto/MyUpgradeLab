import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

// Ruta intermedia para el flujo de recuperacion de contraseña (y cualquier
// otro link de confirmacion). Soporta dos formatos:
// - `?code=...` (PKCE estandar, cuando el propio navegador del usuario pide
//   el link via resetPasswordForEmail).
// - `?token_hash=...&type=...` (cuando el link lo generamos nosotros con
//   admin.generateLink desde requestPasswordReset en actions/auth.ts —
//   admin.generateLink no es compatible con PKCE, asi que ahi usamos
//   verifyOtp en vez de exchangeCodeForSession).
// Canjea el codigo/token por una sesion real (cookie) antes de mandar a la
// persona a la pagina donde efectivamente cambia la contraseña.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/reset-password'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Error canjeando codigo de recuperacion:', error.message, error)
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Error verificando token_hash de recuperacion:', error.message, error)
  } else {
    console.error('Ruta /auth/confirm llamada sin parametro code ni token_hash')
  }

  return NextResponse.redirect(
    `${origin}/forgot-password?error=${encodeURIComponent('El link de recuperacion es invalido o expiro, pedi uno nuevo')}`
  )
}
