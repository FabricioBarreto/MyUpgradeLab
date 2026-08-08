// Regla de negocio definida en docs/MASTER.md: precio fijo de la suscripcion
// mensual. Se revisa trimestralmente contra inflacion (proceso manual, no
// automatizado). Vive en su propio archivo (en vez de en subscribe.ts) porque
// un archivo 'use server' solo puede exportar funciones async, y esta
// constante la necesitan tanto la accion de suscripcion como el webhook de
// Mercado Pago (para calcular la comision de afiliados).
// TEMPORAL (04/08/2026): bajado a 200 para probar un pago real de
// suscripcion en produccion. Volver a 7999 despues de la prueba — ver nota
// en docs/TASKS.md.
export const SUBSCRIPTION_PRICE = 200

// NEXT_PUBLIC_APP_URL puede estar cargada con o sin barra final segun el
// entorno (en Vercel quedo con barra final, ".../" — eso generaba links
// rotos tipo "https://sitio.com//?ref=CODIGO", doble barra, en cualquier
// lugar que hiciera `${appUrl}/algo`). Esta funcion normaliza sacando la
// barra final, asi da lo mismo como este cargada la variable.
export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '')
}
