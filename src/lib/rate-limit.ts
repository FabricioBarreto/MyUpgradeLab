import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'

// Rate limiting simple por IP para formularios publicos sin login
// (sugerencias, arrepentimiento). No usa Redis/Upstash — alcanza con una
// tabla en Supabase dado el volumen actual del sitio. Usa siempre el
// service role: la tabla rate_limits no tiene policies, asi que solo es
// accesible desde el servidor, nunca desde el cliente.
const WINDOW_MINUTES = 10
const MAX_REQUESTS_PER_WINDOW = 3

// Devuelve true si el envio esta permitido (y lo registra). Devuelve false
// si ya se supero el limite en la ventana de tiempo — en ese caso no
// registra nada nuevo, para no extender la ventana de bloqueo indefinidamente.
export async function checkRateLimit(action: string): Promise<boolean> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  const service = createServiceClient()
  const cutoff = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  const { count, error: countError } = await service
    .from('rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('action', action)
    .eq('ip', ip)
    .gte('created_at', cutoff)

  if (countError) {
    console.error('Error consultando rate_limits, se permite el envio por defecto', countError)
    return true
  }

  if ((count ?? 0) >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  const { error: insertError } = await service.from('rate_limits').insert({ action, ip })
  if (insertError) {
    console.error('Error registrando rate_limits', insertError)
  }

  return true
}
