# TASKS — UpgradeLab

## To Do
- [ ] Integracion Mercado Pago (Suscripciones) — incluir periodo de prueba de 7 dias (free_trial en preapproval)
- [ ] Sistema de afiliados — dos ramas: comision cash para promotores (30%) + descuento para el referido casual (doble beneficio). La rama de descuento depende de agregar soporte de cupon en el checkout (coupon_code de la preferencia).
- [ ] Progreso y certificado por curso (marcar completado + certificado automatico) — independiente de Mercado Pago, se puede empezar ahora
- [ ] Canal de comunidad por categoria (link a WhatsApp/Discord en el dashboard) — independiente de Mercado Pago, se puede empezar ahora
- [ ] Dashboard "segui donde quedaste" (ya se puede ver "Mis compras"; falta trackear ultimo acceso/progreso una vez exista course_progress)
- [ ] Revision trimestral de precios (proceso de negocio, no requiere codigo — ver regla en MASTER.md)
- [ ] Formulario de sugerencias
- [ ] Emails transaccionales (SMTP) — ej. confirmar compra aprobada
- [ ] Deploy inicial en Vercel

## In Progress

## Done
- [x] Setup inicial Next.js + estructura de carpetas + docs
- [x] Crear proyecto en Supabase y conectar variables de entorno (10/07/2026)
- [x] Crear schema base de datos (ver DATABASE.md) (10/07/2026)
- [x] Auth (registro/login) con Supabase (10/07/2026)
- [x] Panel admin basico (10/07/2026)
- [x] Definir precios y % de afiliados (13/07/2026)
- [x] Landing publica + catalogo de cursos (13/07/2026)
- [x] Integracion Mercado Pago (Checkout Pro) — compra individual, webhook y dashboard de compras (14/07/2026). Pendiente de configurar credenciales reales, ver DATABASE.md.
