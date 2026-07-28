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
