import { MercadoPagoConfig } from 'mercadopago'

// Mercado Pago exige una aplicacion por solucion: Checkout Pro y Suscripciones
// son dos apps distintas en el panel de MP, cada una con su propio access
// token y su propio webhook secret.
export type MercadoPagoApp = 'checkout' | 'suscripciones'

const ACCESS_TOKEN_ENV: Record<MercadoPagoApp, string> = {
  checkout: 'MP_ACCESS_TOKEN_CHECKOUT',
  suscripciones: 'MP_ACCESS_TOKEN_SUSCRIP',
}

const WEBHOOK_SECRET_ENV: Record<MercadoPagoApp, string> = {
  checkout: 'MP_WEBHOOK_SECRET_CHECKOUT',
  suscripciones: 'MP_WEBHOOK_SECRET_SUSCRIP',
}

const configs: Partial<Record<MercadoPagoApp, MercadoPagoConfig>> = {}

// Config compartida del SDK de Mercado Pago, una por app. Se crea una sola
// vez por app y se reutiliza en las acciones de checkout/suscripcion y en el
// webhook.
export function getMercadoPagoConfig(app: MercadoPagoApp): MercadoPagoConfig {
  if (!configs[app]) {
    const accessToken = process.env[ACCESS_TOKEN_ENV[app]]
    if (!accessToken) {
      throw new Error(`Falta configurar ${ACCESS_TOKEN_ENV[app]} en las variables de entorno`)
    }
    configs[app] = new MercadoPagoConfig({ accessToken })
  }
  return configs[app]!
}

export function getMercadoPagoWebhookSecret(app: MercadoPagoApp): string | undefined {
  return process.env[WEBHOOK_SECRET_ENV[app]] || undefined
}
