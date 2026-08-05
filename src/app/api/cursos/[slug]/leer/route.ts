import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractRawPublicId, getSignedAuthenticatedPdfUrl } from '@/lib/cloudinary'

// Proxy de lectura de cursos: nunca exponemos al navegador la URL de
// Cloudinary. En cada request verificamos en el momento si el usuario tiene
// acceso (compra aprobada o suscripcion activa) y, solo si corresponde,
// generamos un link firmado nuevo y devolvemos los bytes del PDF nosotros
// mismos. Asi, si alguien cancela la suscripcion, en la siguiente visita
// este chequeo falla y el acceso se corta al instante — no depende de que
// el link viejo "expire" solo.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('message', 'Inicia sesion para acceder al curso')
    loginUrl.searchParams.set('redirect', `/api/cursos/${slug}/leer`)
    return NextResponse.redirect(loginUrl)
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug, resource_url, is_active')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!course || !course.resource_url) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
  }

  // Compra individual aprobada de este curso puntual.
  const { data: purchase } = await supabase
    .from('purchases')
    .select('id, status, first_accessed_at')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .eq('status', 'approved')
    .maybeSingle()

  // Suscripcion activa da acceso a todo el catalogo.
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const hasPurchase = Boolean(purchase)
  const hasActiveSubscription = subscription?.status === 'active'

  if (!hasPurchase && !hasActiveSubscription) {
    return NextResponse.json(
      { error: 'No tenes acceso a este curso. Comprralo o suscribite para acceder.' },
      { status: 403 }
    )
  }

  // Prueba objetiva de acceso: si es una compra individual y todavia no
  // habia accedido nunca, dejamos registrado el momento. Sirve para resolver
  // pedidos de arrepentimiento (ver /reembolsos) sin depender de lo que diga
  // la persona — si ya hay un first_accessed_at, la excepcion del art. 1116
  // CCyC aplica y el pedido se puede rechazar con fundamento.
  if (purchase && !purchase.first_accessed_at) {
    await supabase
      .from('purchases')
      .update({ first_accessed_at: new Date().toISOString() })
      .eq('id', purchase.id)
  }

  const publicId = extractRawPublicId(course.resource_url)
  if (!publicId) {
    console.error('No se pudo extraer el public_id de Cloudinary de', course.resource_url)
    return NextResponse.json({ error: 'Error interno al cargar el curso' }, { status: 500 })
  }

  const signedUrl = getSignedAuthenticatedPdfUrl(publicId)

  const cloudinaryResponse = await fetch(signedUrl)
  if (!cloudinaryResponse.ok || !cloudinaryResponse.body) {
    console.error('Error obteniendo el PDF de Cloudinary', cloudinaryResponse.status)
    return NextResponse.json({ error: 'Error cargando el archivo del curso' }, { status: 502 })
  }

  // Compra individual: la persona pago por poseerlo, se lo puede descargar
  // y guardar. Solo por suscripcion: se muestra en el navegador (inline),
  // sin invitar a descargarlo, ya que el acceso es "mientras este activa".
  const disposition = hasPurchase ? 'attachment' : 'inline'
  const filename = `${course.slug}.pdf`

  return new NextResponse(cloudinaryResponse.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${disposition}; filename="${filename}"`,
      // Nunca cachear una respuesta que depende de un chequeo de acceso
      // hecho en el momento.
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
    },
  })
}
