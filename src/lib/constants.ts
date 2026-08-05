// Regla de negocio definida en docs/MASTER.md: precio fijo de la suscripcion
// mensual. Se revisa trimestralmente contra inflacion (proceso manual, no
// automatizado). Vive en su propio archivo (en vez de en subscribe.ts) porque
// un archivo 'use server' solo puede exportar funciones async, y esta
// constante la necesitan tanto la accion de suscripcion como el webhook de
// Mercado Pago (para calcular la comision de afiliados).
export const SUBSCRIPTION_PRICE = 7999
