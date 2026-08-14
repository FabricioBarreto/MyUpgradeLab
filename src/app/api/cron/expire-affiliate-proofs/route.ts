import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { deleteAffiliatePaymentProof } from '@/lib/cloudinary'

// Corre una vez por dia via Vercel Cron (ver vercel.json). Borra de
// Cloudinary los comprobantes de pago a afiliados con mas de 30 dias, para
// no acumular capturas viejas que ya cumplieron su proposito (evidencia del
// pago, no un archivo permanente). El registro de que se pago (paid_at)
// nunca se borra, solo el archivo adjunto y su referencia.
const PROOF_LIFETIME_DAYS = 30

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createServiceClient()

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - PROOF_LIFETIME_DAYS)

  const { data: expired, error } = await supabase
    .from('affiliate_referrals')
    .select('id, proof_url')
    .not('proof_url', 'is', null)
    .lt('proof_uploaded_at', cutoff.toISOString())

  if (error) {
    console.error('Error buscando comprobantes vencidos', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let deleted = 0
  for (const row of expired ?? []) {
    if (!row.proof_url) continue
    try {
      await deleteAffiliatePaymentProof(row.proof_url)
      await supabase
        .from('affiliate_referrals')
        .update({ proof_url: null, proof_uploaded_at: null })
        .eq('id', row.id)
      deleted++
    } catch (err) {
      console.error(`Error borrando comprobante ${row.proof_url}`, err)
    }
  }

  return NextResponse.json({ deleted, checked: expired?.length ?? 0 })
}
