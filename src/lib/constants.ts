// Regla de negocio definida en docs/MASTER.md: precio fijo de la suscripcion
// mensual. Se revisa trimestralmente contra inflacion (proceso manual, no
// automatizado). Vive en su propio archivo (en vez de en subscribe.ts) porque
// un archivo 'use server' solo puede exportar funciones async, y esta
// constante la necesitan tanto la accion de suscripcion como el webhook de
// Mercado Pago (para calcular la comision de afiliados).
// Bajado TEMPORALMENTE a 200 el 04/08/2026 para probar un pago real de
// suscripcion en produccion sin arriesgar $7.999 reales. Vuelto a la
// normalidad el 08/08/2026, prueba ya completada.
export const SUBSCRIPTION_PRICE = 7999

// NEXT_PUBLIC_APP_URL puede estar cargada con o sin barra final segun el
// entorno (en Vercel quedo con barra final, ".../" — eso generaba links
// rotos tipo "https://sitio.com//?ref=CODIGO", doble barra, en cualquier
// lugar que hiciera `${appUrl}/algo`). Esta funcion normaliza sacando la
// barra final, asi da lo mismo como este cargada la variable.
export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '')
}

// Periodo de espera antes de que una comision de afiliado quede habilitada
// para pago (ver docs/TASKS.md, 14/08/2026). Una venta genera la comision
// de inmediato con status 'pending', pero no se muestra como pagable hasta
// que pasan estos dias — para reducir el riesgo de pagar comision sobre una
// venta que despues se reembolsa (excepcion del art. 1116 CCyC solo cubre
// hasta que la persona accede al contenido, pero igual da margen de reaccion).
export const AFFILIATE_PAYOUT_HOLD_DAYS = 30
