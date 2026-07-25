# TASKS — UpgradeLab

## To Do
- [ ] URGENTE: actualizar las Environment Variables en Vercel (Project Settings > Environment Variables) con las mismas de `.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — y redeployar. Local ya migro al proyecto correcto (`mzylzoqmxprrigdxlwsc`) pero produccion en Vercel probablemente sigue apuntando al proyecto viejo hasta que se actualice y redeploye.
- [ ] Crear usuario admin: registrarse normal en `/register`, despues correr `update public.profiles set role = 'admin' where id = 'UUID';` en el SQL Editor (UUID se ve en Authentication > Users)
- [ ] Crear app dedicada de Checkout Pro en el panel de Mercado Pago y cargar credenciales reales en `MP_ACCESS_TOKEN_CHECKOUT` / `MP_WEBHOOK_SECRET_CHECKOUT` (quedó separada de la app de Suscripciones, ver nota en MASTER.md)
- [ ] Sistema de afiliados — dos ramas: comision cash para promotores (30%) + descuento para el referido casual (doble beneficio). La rama de descuento depende de agregar soporte de cupon en el checkout (coupon_code de la preferencia).
- [ ] Progreso y certificado por curso (marcar completado + certificado automatico) — independiente de Mercado Pago, se puede empezar ahora
- [ ] Cargar los links reales de WhatsApp/Discord en `src/lib/community.ts` (el codigo y el UI del dashboard ya estan listos, ver Done)
- [ ] Dashboard "segui donde quedaste" (ya se puede ver "Mis compras"; falta trackear ultimo acceso/progreso una vez exista course_progress)
- [ ] Revision trimestral de precios (proceso de negocio, no requiere codigo — ver regla en MASTER.md)
- [ ] Formulario de sugerencias

## In Progress
- [ ] Integracion Mercado Pago (Suscripciones) — incluir periodo de prueba de 7 dias (free_trial en preapproval). App "MyUpgradeLab" creada en panel MP (16/07/2026), credenciales de prueba cargadas. Codigo implementado (16/07/2026): `subscribe.ts` (preapproval ad-hoc + free_trial), webhook extendido para `subscription_preapproval`, boton de suscripcion en dashboard. Falta: completar un pago de prueba con la cuenta compradora de test (ya deberia poder probarse en local, `subscriptions` ya existe en el proyecto correcto).

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
- [x] Curso "Estudiar con IA: NotebookLM, Claude y Nano Banana" — PDF de 12 paginas armado, subido a Cloudinary y cargado en `courses` del proyecto correcto de Supabase (25/07/2026). $4.000 ARS, categoria estudio_ia, access_type both.
- [x] Migracion de proyecto Supabase (25/07/2026) — de `wrlxeyzouasczduabgxq` (vacio) a `mzylzoqmxprrigdxlwsc` (el real, "MyUpgradeLab" produccion). Corrido `docs/schema.sql` completo (8 tablas + RLS + is_admin() + trigger + backfill). `.env.local` actualizado con las nuevas Publishable/Secret keys. Verificado con curl contra la REST API: `courses` y `profiles` responden 200. Falta actualizar las mismas env vars en Vercel y redeployar (ver To Do).
- [x] Registro: agregado campo "Confirmar contraseña" con validacion server-side, y auto-login al dashboard si Supabase devuelve sesion activa (depende de que "Confirm email" este desactivado en el proyecto de Supabase) (24/07/2026)
- [x] Canal de comunidad por categoria (24/07/2026) — `src/lib/community.ts` (mapa categoria -> link, vacio por ahora) + seccion "Comunidad" en el dashboard, que solo muestra los links de las categorias a las que el usuario tiene acceso (compra aprobada o suscripcion activa). Falta cargar los links reales, ver To Do.
