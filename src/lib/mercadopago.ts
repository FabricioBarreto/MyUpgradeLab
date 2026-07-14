import { MercadoPagoConfig } from 'mercadopago'

let config: MercadoPagoConfig | null = null

// Config compartida del SDK de Mercado Pago. Se crea una sola vez y se
// reutiliza en las acciones de checkout y en el webhook.
export function getMercadoPagoConfig(): MercadoPagoConfig {
  if (!config) {
    config = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    })
  }
  return config
}
