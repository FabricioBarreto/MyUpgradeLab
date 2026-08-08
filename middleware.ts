import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  // Programa de afiliados: si alguien llega con ?ref=CODE, lo guardamos en
  // una cookie por 60 dias. El signup lee esta cookie para saber que
  // afiliado lo trajo (ver src/lib/actions/auth.ts). No pisamos una cookie
  // ya existente: gana el primer link que la persona clickeo.
  const ref = request.nextUrl.searchParams.get('ref')
  if (ref && !request.cookies.get('ul_ref')) {
    supabaseResponse.cookies.set('ul_ref', ref, {
      maxAge: 60 * 60 * 24 * 60,
      path: '/',
      sameSite: 'lax',
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
