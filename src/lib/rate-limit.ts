import { headers } from 'next/headers'

// Rate limiting simple en memoria, pensado para frenar abuso basico en
// formularios publicos sin auth (sugerencias, arrepentimiento). Limita por
// IP + tipo de accion.
//
// Limitacion conocida: no es distribuido. En Vercel cada instancia
// serverless tiene su propio mapa en memoria, asi que si el trafico escala
// a varias instancias el limite real efectivo puede terminar siendo mas alto
// que MAX_REQUESTS (cada instancia cuenta por separado). Para el volumen
// actual del sitio esto alcanza como primera barrera; si mas adelante hace
// falta un limite estricto y compartido entre instancias, migrar a Upstash
// Redis (@upstash/ratelimit) es el paso natural — misma firma de funcion,
// solo cambia la implementacion interna.

const WINDOW_MS = 5 * 60 * 1000 // ventana de 5 minutos
const MAX_REQUESTS = 3 // maximo de envios por IP+accion dentro de la ventana

type Bucket = { count: number; windowStart: number }

const buckets = new Map<string, Bucket>()

// Barrido perezoso: cada llamada limpia entradas vencidas, para no acumular
// memoria indefinidamente en una misma instancia de larga vida.
function cleanup(now: number) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > WINDOW_MS) {
      buckets.delete(key)
    }
  }
}

// Devuelve true si la request esta permitida, false si supero el limite.
export async function checkRateLimit(action: string): Promise<boolean> {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'

  const key = `${action}:${ip}`
  const now = Date.now()

  cleanup(now)

  const existing = buckets.get(key)

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now })
    return true
  }

  if (existing.count >= MAX_REQUESTS) {
    return false
  }

  existing.count += 1
  return true
}
