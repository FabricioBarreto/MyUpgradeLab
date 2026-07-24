# TASKS — UpgradeLab

## To Do
- [ ] URGENTE: `courses` y `profiles` no aparecen en el schema cache de PostgREST (`PGRST205: Could not find the table 'public.courses'`). Confirmado en produccion (24/07/2026) probando directo contra la REST API con la service role key. Puede estar afectando el catalogo publico silenciosamente porque `src/app/(public)/cursos/page.tsx` ignora el `error` de la query. Revisar en el dashboard de Supabase: Table Editor (¿existen las tablas?) y Settings > API (recargar schema cache / `NOTIFY pgrst, 'reload schema';`).
- [ ] Crear app dedicada de Checkout Pro en el panel de Mercado Pago y cargar credenciales reales en `MP_ACCESS_TOKEN_CHECKOUT` / `MP_WEBHOOK_SECRET_CHECKOUT` (quedó separada de la app de Suscripciones, ver nota en MASTER.md)
- [ ] Sistema de afiliados — dos ramas: comision cash para promotores (30%) + descuento para el referido casual (doble beneficio). La rama de descuento depende de agregar soporte de cupon en el checkout (coupon_code de la preferencia).
- [ ] Progreso y certificado por curso (marcar completado + certificado automatico) — independiente de Mercado Pago, se puede empezar ahora
- [ ] Canal de comunidad por categoria (link a WhatsApp/Discord en el dashboard) — independiente de Mercado Pago, se puede empezar ahora
- [ ] Dashboard "segui donde quedaste" (ya se puede ver "Mis compras"; falta trackear ultimo acceso/progreso una vez exista course_progress)
- [ ] Revision trimestral de precios (proceso de negocio, no requiere codigo — ver regla en MASTER.md)
- [ ] Formulario de sugerencias

## In Progress
- [ ] Integracion Mercado Pago (Suscripciones) — incluir periodo de prueba de 7 dias (free_trial en preapproval). App "MyUpgradeLab" creada en panel MP (16/07/2026), credenciales de prueba cargadas. Codigo implementado (16/07/2026): `subscribe.ts` (preapproval ad-hoc + free_trial), webhook extendido para `subscription_preapproval`, boton de suscripcion en dashboard. Falta: configurar webhook secret de esta app en el panel MP (Notificaciones > Webhooks) y completar un pago de prueba con la cuenta compradora de test.

## Done
- [x] Setup inicial Next.js + estructura de carpetas + docs
- [x] Crear proyecto en Supabase y conectar variables de entorno (10/07/2026)
- [x] Crear schema base de datos (ver DATABASE.md) (10/07/2026)
- [x] Auth (registro/login) con Supabase (10/07/2026)
- [x] Panel admin basico (10/07/2026)
- [x] Definir precios y % de afiliados (13/07/2026)
- [x] Landing publica + catalogo de cursos (13/07/2026)
- [x] Integracion Mercado Pago (Checkout Pro) — compra individual, webhook y dashboard de compras (14/07/2026). Pendiente de configurar credenciales reales, ver DATABASE.md.
- [x] Deploy inicial en Vercel (24/07/2026) — https://my-upgrade-lab.vercel.app
- [x] Emails transaccionales (SMTP) — Gmail con app password (24/07/2026). `src/lib/email.ts` (transporter + templates), enganchado al webhook de Mercado Pago: envia "compra aprobada" cuando una purchase pasa a `approved` y "suscripcion activa" cuando una subscription pasa a `active`, solo en la transicion (no reenvia en notificaciones repetidas).
