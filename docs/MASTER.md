# MASTER — UpgradeLab

## Idea del proyecto
Plataforma web de venta de cursos/recursos educativos (programación/IA, 
estudio con IA, inglés, entrevistas de trabajo, negocio para freelancers). Modelo híbrido:
- Compra individual: PDF descargable (pago único) — la persona pagó por poseerlo, se lo lleva.
- Suscripción mensual: acceso a todo el catálogo mientras esté activa, leído como página web
  (HTML) dentro de la propia plataforma, sin descarga — ver "Formato de los cursos" abajo.
- Programa de afiliados con comisión por referidos
- Panel admin para gestionar cursos, sugerencias y pagos manuales

## Formato de los cursos: PDF y HTML conviven (08/08/2026)
Cada curso tiene dos formas posibles de entregarse, y ambas pueden coexistir en la misma fila
de `courses`:
- `resource_url` (PDF en Cloudinary): es lo que se descarga cuando alguien lo compra
  individualmente. Se sigue cargando igual que siempre.
- `content_html` (texto, columna nueva): es lo que se muestra como artículo web cuando alguien
  entra por suscripción, en `dashboard/leer/[slug]`. No se ofrece descarga en este camino —
  la idea es que el acceso dure mientras la suscripción esté activa, no que quede una copia.
- Si un curso todavía no tiene `content_html` cargado, la suscripción cae al comportamiento
  viejo (el PDF embebido inline, sin descarga tampoco, pero sin el formato de artículo). Un
  curso puede no tener `resource_url` si se piensa solo para suscripción, o no tener
  `content_html` si todavía no se migró — no son excluyentes ni obligatorios entre sí.
- Al cargar o editar un curso nuevo desde ahora (`/admin/courses/new` o `/admin/courses/[id]/edit`),
  conviene cargar los dos: el PDF para quien compra suelto, el HTML para quien lee por
  suscripción. Ver DATABASE.md ("Lectura de cursos: PDF vs HTML") para el detalle técnico.

## Nombre de marca
UpgradeLab

## Stack tecnológico
- Frontend/Backend: Next.js (App Router, TypeScript, Tailwind)
- Base de datos: Supabase (PostgreSQL + Auth)
- Almacenamiento de video/imágenes: Cloudinary
- Pagos: Mercado Pago (Checkout Pro + Suscripciones/Preapproval)
- Emails transaccionales: SMTP (Nodemailer)
- Hosting: Vercel (dominio provisorio .vercel.app)

## Cómo trabajamos
- Los archivos de contexto del proyecto viven en /docs (MASTER.md, DATABASE.md, TASKS.md)
- Toda tarea nueva se agrega primero a TASKS.md antes de implementarla
- Al terminar una tarea, se mueve de "To Do" a "Done" con fecha
- Los cambios al schema de base de datos se documentan en DATABASE.md antes de aplicarse
- Las decisiones de negocio (precios, % afiliados, reglas) se agregan a este archivo
- Convención de commits: tipo(alcance): descripción — ej. feat(auth): agregar login con Supabase
- Ante ambigüedad, se prioriza simplicidad y lo que ya soporta Supabase/Vercel de fábrica

## Reglas de negocio definidas
- Moneda: todos los precios se manejan en ARS (pesos argentinos), no en USD, porque el cobro es via Mercado Pago Argentina.
- Precio suscripción mensual: $7.999 ARS/mes (referencia: por debajo de Netflix Estandar ~$21.000 y por encima de Spotify Individual ~$5.000, ajustado a que UpgradeLab es un catalogo mas chico y de nicho).
- Precio PDFs individuales: $3.000-$8.000 ARS segun profundidad del curso (recursos simples en la parte baja, cursos mas extensos de programacion/IA en la parte alta). Definir precio por curso al cargarlo en el panel admin, siempre por debajo del valor de la suscripcion mensual.
- Comisión de afiliados: 40% por venta (suscripcion o PDF individual).
- Comisión recurrente o solo primer pago: recurrente, se paga mientras el referido mantenga la suscripcion activa (la tabla `affiliate_referrals` ya soporta esto via `source_id` apuntando a `subscriptions`).
- Nota: falta confirmar el % de comisión exacto que cobra Mercado Pago Checkout Pro para Argentina antes de cerrar margenes finales (consultar panel de Mercado Pago).
- Revisión de precios: cada 3 meses, revisar precio de suscripción y de PDFs contra IPC/dólar (inflación proyectada ~30% anual en 2026 erosiona precios fijos en pesos). No es automático, es una revisión manual del fundador.
- Programa de afiliados/referidos con dos ramas: (1) afiliados/promotores — comisión en efectivo del 40%, pensado para alguien que promociona activamente como si fuera un ingreso; (2) referidos casuales — el amigo referido recibe un descuento (a definir %) en su primer pago, además de la comisión normal para quien lo invitó. La rama 2 requiere que el checkout de Mercado Pago soporte aplicar un descuento por código.
- Suscripción sin prueba gratuita: se cobra desde el primer día. Se probó con 7 días de `free_trial` (Mercado Pago Preapproval) y se sacó por decisión del fundador (08/08/2026) — con trial, MP solo crea una autorización (preapproval) y no un cobro real hasta que termina el período, lo que además complicaba verificar pagos de punta a punta.

## Mercado Pago: dos apps separadas
Mercado Pago exige una aplicacion por solucion en su panel de desarrolladores, asi que Checkout Pro y Suscripciones son dos apps distintas con credenciales propias (`MP_ACCESS_TOKEN_CHECKOUT` / `MP_ACCESS_TOKEN_SUSCRIP`, y sus respectivos `MP_WEBHOOK_SECRET_*`). `src/lib/mercadopago.ts` expone `getMercadoPagoConfig(app)` para elegir el config correcto segun la solucion. El webhook (`src/app/api/webhooks/mercadopago/route.ts`) distingue el tipo de evento (`payment` vs `subscription_preapproval`) para usar la app y el secret correctos.

La suscripcion se implementa "sin plan asociado" (ad-hoc, sin crear un `preapproval_plan` en el dashboard de MP): la server action `createSubscription` en `src/lib/actions/subscribe.ts` crea el `Preapproval` directo con el monto fijo (sin `free_trial`, cobro desde el primer dia) y redirige al `init_point` igual que Checkout Pro. Elegido asi porque hoy hay un solo precio de suscripcion; si en el futuro hay varios planes, migrar a `preapproval_plan`.

## Estructura de carpetas (referencia)
Ver DATABASE.md para schema completo.
/src/app/(public), /src/app/(dashboard), /src/app/(admin), /src/app/api, /src/lib
