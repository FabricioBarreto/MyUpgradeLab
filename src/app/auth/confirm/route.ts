import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Ruta intermedia para el flujo de recuperacion de contraseña (y cualquier
// otro link de confirmacion que Supabase mande con `?code=`, mecanismo PKCE).
// Canjea el codigo por una sesion real (cookie) antes de mandar a la persona
// a la pagina donde efectivamente cambia la contraseña.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/reset-password'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Error canjeando codigo de recuperacion:', error.message, error)
  } else {
    console.error('Ruta /auth/confirm llamada sin parametro code')
  }

  return NextResponse.redirect(
    `${origin}/forgot-password?error=${encodeURIComponent('El link de recuperacion es invalido o expiro, pedi uno nuevo')}`
  )
}
