# TASKS — UpgradeLab

## Convencion: donde viven los archivos de los cursos
Los fuentes (HTML) y el PDF final de cada curso se guardan en `/cursos/<categoria>/<slug-del-nivel-o-curso>.html|.pdf` (28/07/2026, reorganizado desde archivos sueltos en la raiz). El PDF servido a los compradores vive en Cloudinary (carpeta `courses/`, ver `resource_url` en la tabla `courses` de Supabase) — la copia en `/cursos` es solo el original de referencia para editar o resubir. Estructura actual:
- `cursos/estudio-ia/estudiar-con-ia-notebooklm-claude-nano-banana.pdf`
- `cursos/programacion-ia/nivel-1-fundamentos.html` + `.pdf`
- `cursos/programacion-ia/nivel-2-flujos-de-trabajo.html` + `.pdf`
- `cursos/programacion-ia/nivel-3-proyectos-completos.html` + `.pdf`

## To Do
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
- [x] Migracion de proyecto Supabase (25/07/2026) — de `wrlxeyzouasczduabgxq` (vacio) a `mzylzoqmxprrigdxlwsc` (el real, "MyUpgradeLab" produccion). Corrido `docs/schema.sql` completo (8 tablas + RLS + is_admin() + trigger + backfill). `.env.local` y las Environment Variables de Vercel actualizadas con las nuevas Publishable/Secret keys, y redeployado. Verificado en produccion: `https://my-upgrade-lab.vercel.app/cursos` ya muestra el catalogo real.
- [x] Registro: agregado campo "Confirmar contraseña" con validacion server-side, y auto-login al dashboard si Supabase devuelve sesion activa (depende de que "Confirm email" este desactivado en el proyecto de Supabase) (24/07/2026)
- [x] Canal de comunidad por categoria (24/07/2026) — `src/lib/community.ts` (mapa categoria -> link, vacio por ahora) + seccion "Comunidad" en el dashboard, que solo muestra los links de las categorias a las que el usuario tiene acceso (compra aprobada o suscripcion activa). Falta cargar los links reales, ver To Do.
- [x] Usuario admin creado (25/07/2026) via `update public.profiles set role = 'admin'` en el proyecto correcto de Supabase.
- [x] App dedicada de Checkout Pro creada en el panel de Mercado Pago con credenciales de **PRODUCCION** (25/07/2026) — `MP_ACCESS_TOKEN_CHECKOUT` / `MP_PUBLIC_KEY_CHECKOUT` / `MP_WEBHOOK_SECRET_CHECKOUT` cargados en `.env.local` con prefijo `APP_USR-` (no `TEST-`), o sea que ya procesa pagos reales, no de sandbox. Ojo con esto al probar el flujo de compra.
- [x] Fix: `checkout.ts` y `subscribe.ts` llamaban a `getMercadoPagoConfig()` fuera del `try/catch`, asi que si faltaba el access token tiraba una excepcion sin manejar y crasheaba la pagina en vez de redirigir con un mensaje de error prolijo (encontrado en produccion, 25/07/2026, via el log de Vercel: "Falta configurar MP_ACCESS_TOKEN_CHECKOUT"). Movido el llamado adentro del try en ambos archivos.
- [x] Webhook de Checkout Pro funcionando de punta a punta en produccion (25/07/2026). Causas encontradas y corregidas: (1) la "URL para prueba" en el panel de MP tenia solo el dominio sin el path (`/api/webhooks/mercadopago`), asi que las notificaciones nunca llegaban a la ruta correcta; (2) el evento "Pagos (legacy)" es del tipo IPN clasico que a veces llega como `GET` en vez de `POST`, y la ruta solo tenia handler `POST` — se agrego handler `GET` con la misma logica (`handleNotification` compartida). Confirmado con una compra real de prueba ($4.000, operacion #169682130617): la purchase paso a `approved` sola, sin intervencion manual. Ojo: la URL del webhook hay que configurarla en la pestaña **"Modo productivo"** del panel de MP, no en "Modo de prueba", porque las credenciales son `APP_USR-` (produccion, `live_mode: true`). Nota: el boton "Acceder" en si lleva a un link de Cloudinary que hoy da 401 (ver tarea de Restricted media types en To Do) — eso es un tema aparte de Cloudinary, no de Mercado Pago ni del webhook.
- [x] Una compra de prueba anterior (79bb7cc2-..., pago aprobado en MP pero sin webhook configurado con el path correcto todavia) se corrigio a mano en la base (25/07/2026) una vez identificado el pago real via la API de Payments de MP.
- [x] Cambio de cuenta de Cloudinary (25/07/2026) — nueva cuenta `ydpwntwn` (antes `cienjgys`). `.env.local` actualizado (`CLOUDINARY_CLOUD_NAME`/`API_KEY`/`API_SECRET`), PDF re-subido, y `courses.resource_url` actualizado en Supabase. Habilitado "Allow delivery of PDF and ZIP files" en Settings > Security > Restricted media types de la cuenta nueva (el bloqueo 401 es una config por cuenta, no viaja al migrar). Verificado con curl: 200 + `content-type: application/pdf`.
- [x] Curso "Programar con IA — Nivel 1: Fundamentos" (28/07/2026) — primer PDF de la serie Programación/IA (dividida en 3 niveles por precio/profundidad, ver MASTER.md). Contenido: panorama de herramientas no-code (Lovable, Bolt.new, Replit, v0), estructura de un buen prompt, proyecto guiado paso a paso, glosario minimo, como iterar cuando el resultado no es el esperado, limites y cuidados. 10 paginas, subido a Cloudinary (`courses/programacion-ia-nivel1.pdf`) y cargado en `courses` de Supabase. $4.000 ARS, categoria `programacion_ia`, access_type `both`.
- [x] Curso "Programar con IA — Nivel 2: Flujos de trabajo" (28/07/2026) — segundo PDF de la serie, para quien ya programa. Contenido: comparativa Claude Code / Cursor / GitHub Copilot, puesta en marcha, prompting tecnico con contexto/restricciones/verificacion, casos de uso reales (debugging, refactor, tests, documentacion), integracion a flujo de git, buenas practicas y limites. 11 paginas, subido a Cloudinary (`courses/programacion-ia-nivel2.pdf`) y cargado en `courses` de Supabase. $5.500 ARS, categoria `programacion_ia`, access_type `both`.
- [x] Curso "Programar con IA — Nivel 3: Proyectos completos" (28/07/2026) — cierre de la serie de 3 PDFs de Programación/IA. Contenido: planificar arquitectura antes de programar, construir por etapas verificables (base de datos, backend, frontend, integraciones), testing de casos limite, deploy a produccion, mantenimiento (logs, monitoreo), errores comunes en proyectos reales con IA. 10 paginas, subido a Cloudinary (`courses/programacion-ia-nivel3.pdf`) y cargado en `courses` de Supabase. $7.000 ARS, categoria `programacion_ia`, access_type `both`. Con esto la serie completa de Programación/IA (Niveles 1, 2 y 3) esta cargada y verificada en Supabase.
