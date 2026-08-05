import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCertificatePdf } from '@/lib/certificate'

// Genera el certificado de finalizacion al vuelo (pdf-lib es JS puro, sin
// dependencias del sistema, asi que corre bien en un entorno serverless).
// Solo se emite si existe una fila en course_progress con completed_at para
// este usuario y este curso — no depende de tener acceso vigente en este
// momento, una vez que lo completaste el certificado es tuyo.
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
    loginUrl.searchParams.set('message', 'Inicia sesion para descargar tu certificado')
    loginUrl.searchParams.set('redirect', `/api/cursos/${slug}/certificado`)
    return NextResponse.redirect(loginUrl)
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('slug', slug)
    .maybeSingle()

  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 })
  }

  const { data: progress } = await supabase
    .from('course_progress')
    .select('completed_at')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()

  if (!progress?.completed_at) {
    return NextResponse.json(
      { error: 'Todavia no marcaste este curso como completado' },
      { status: 403 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const studentName = profile?.full_name?.trim() || user.email || 'Estudiante UpgradeLab'

  const pdfBytes = await generateCertificatePdf({
    studentName,
    courseTitle: course.title,
    completedAt: progress.completed_at,
  })

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${slug}.pdf"`,
      'Cache-Control': 'private, no-store, no-cache, must-revalidate',
    },
  })
}
