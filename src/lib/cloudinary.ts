import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Los recursos de `courses` se guardan como `type: authenticated` (privados)
// en Cloudinary desde el 28/07/2026, precisamente para que no se puedan
// compartir/descargar via un link publico fijo. `resource_url` en la base
// sigue guardando la URL vieja (publica) solo como referencia historica; de
// ahi extraemos el public_id real para generar un link firmado nuevo en
// cada request, despues de validar el acceso del usuario en el servidor.
export function extractRawPublicId(resourceUrl: string): string | null {
  const match = resourceUrl.match(/\/upload\/v\d+\/(.+)$/)
  return match ? match[1] : null
}

export function getSignedAuthenticatedPdfUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    type: 'authenticated',
    sign_url: true,
    secure: true,
  })
}

export { cloudinary }

// Comprobantes de pago a afiliados: se suben como `authenticated` (privados,
// igual que los PDFs de cursos) porque son datos sensibles (numero de
// operacion, monto, a veces datos bancarios visibles en la captura). No son
// permanentes: se borran a los 30 dias (ver /api/cron/expire-affiliate-proofs)
// para no acumular data de baja utilidad a largo plazo en Cloudinary. Siempre
// se suben como imagen (captura/foto), nunca PDF.
export async function uploadAffiliatePaymentProof(
  fileBuffer: Buffer,
  affiliateId: string
): Promise<{ publicId: string }> {
  const result = await cloudinary.uploader.upload(
    `data:application/octet-stream;base64,${fileBuffer.toString('base64')}`,
    {
      resource_type: 'image',
      type: 'authenticated',
      folder: 'affiliate-proofs',
      public_id: `${affiliateId}-${Date.now()}`,
    }
  )
  return { publicId: result.public_id }
}

export function getSignedProofUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'image',
    type: 'authenticated',
    sign_url: true,
    secure: true,
  })
}

export async function deleteAffiliatePaymentProof(publicId: string) {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', type: 'authenticated' })
}
