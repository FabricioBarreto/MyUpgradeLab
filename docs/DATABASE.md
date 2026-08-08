# DATABASE — UpgradeLab

## Tablas

### profiles
Extiende `auth.users` de Supabase con datos propios de la app.
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | FK a auth.users(id), PK |
| full_name | text | |
| role | text | 'user' \| 'admin', default 'user' |
| created_at | timestamptz | |

### courses
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| slug | text | unique |
| title | text | |
| description | text | |
| category | text | programacion_ia, estudio_ia, ingles, entrevistas, ventas_freelance |
| price | numeric(10,2) | precio individual |
| access_type | text | 'individual' \| 'subscription_only' \| 'both' |
| resource_url | text | link Cloudinary al PDF/curso (entrega en compra individual) |
| content_html | text | version HTML del curso (08/08/2026), se muestra en la lectura por suscripcion en vez del PDF — ver seccion Mercado Pago/lectura mas abajo |
| cover_image_url | text | |
| is_active | boolean | default true |
| created_at / updated_at | timestamptz | |

### purchases
Compra individual (pago único vía Mercado Pago).
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| course_id | uuid | FK courses |
| amount | numeric(10,2) | |
| status | text | pending \| approved \| rejected \| refunded |
| mp_payment_id | text | id de Mercado Pago |
| created_at | timestamptz | |

### subscriptions
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles |
| status | text | active \| cancelled \| past_due \| paused |
| mp_subscription_id | text | |
| current_period_start / end | timestamptz | |
| created_at | timestamptz | |

### affiliates
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles, unique |
| code | text | unique, código de referido |
| commission_rate | numeric(5,2) | % de comision, 40 por defecto |
| status | text | pending \| approved \| rejected |
| created_at | timestamptz | |

### affiliate_referrals
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| affiliate_id | uuid | FK affiliates |
| referred_user_id | uuid | FK profiles |
| source_type | text | purchase \| subscription |
| source_id | uuid | apunta a purchases.id o subscriptions.id |
| commission_amount | numeric(10,2) | |
| status | text | pending \| paid |
| created_at | timestamptz | |

### course_progress — eliminada (04/08/2026)
Existió brevemente (marca de "completado" por curso + certificado descargable), pero se sacó por decisión
del fundador: la idea era que la persona compra el PDF y avanza a su ritmo, sin ningún tracking de si lo
terminó o no. Tabla, policies y todo el código relacionado (certificado incluido) fueron removidos —
ver TASKS.md (04/08/2026) para el detalle completo.

Unique (user_id, course_id).

### suggestions
| Campo | Tipo | Notas |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK profiles, nullable (permite sugerencia anónima) |
| name / email | text | usado si no hay user_id |
| message | text | not null |
| status | text | new \| reviewed \| implemented \| dismissed |
| created_at | timestamptz | |

## Decisiones tomadas por simplicidad
- Cursos sin lecciones internas por ahora (un recurso único por curso).
- Afiliados: auto-registro con estado pending, aprobación manual queda para el panel admin.
- Comisión de afiliados guardada por afiliado individual (no global), permite tasas distintas si hace falta.
- Comunidad: no se modela en base de datos por ahora, es un link estatico a un grupo externo (WhatsApp/Discord) por categoria, mostrado en el dashboard.

## Pendiente de diseño
- Mecanismo de descuento para "referidos casuales" (rama 2 del programa de afiliados en MASTER.md): falta definir si es un cupon aplicado en el checkout de Mercado Pago (`coupon_code` de la preferencia) o un campo en `affiliate_referrals`. Se define al construir esa rama.

## Mercado Pago — Checkout Pro (implementado 14/07/2026)
Compra individual: `src/lib/actions/checkout.ts` crea una `purchase` en estado `pending` y una preferencia
de Checkout Pro (`external_reference` = id de la purchase). El webhook en
`src/app/api/webhooks/mercadopago/route.ts` recibe la notificacion, busca el pago con la API de Payments,
y actualiza el status de la purchase (`approved` \| `rejected` \| `refunded` \| `pending`) usando un cliente
Supabase con service role (`src/lib/supabase/service.ts`), porque el webhook no tiene sesion de usuario.

**Pendiente antes de que esto funcione en producción/pruebas reales:**
- Completar `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY` y `MP_WEBHOOK_SECRET` en `.env.local` con las credenciales
  reales de la cuenta de Mercado Pago (Tus integraciones > credenciales / webhooks).
- Completar `SUPABASE_SERVICE_ROLE_KEY` (Supabase > Project Settings > API > service_role).
- Configurar la URL de notificaciones en el panel de Mercado Pago apuntando a
  `{NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago` (o via `notification_url` de la preferencia, ya seteado).
- Verificar en Supabase que la tabla `purchases` tenga una policy de **INSERT** que permita a un usuario
  autenticado crear su propia fila (`user_id = auth.uid()`). La documentacion de RLS solo confirma
  lectura ("el usuario ve solo las suyas"); si no existe la policy de insert, el checkout va a fallar
  silenciosamente al crear la purchase.

## Lectura de cursos: PDF vs HTML (08/08/2026)
Hay dos formas de entregar el contenido, segun como se accedio:
- **Compra individual** (`purchases`): siempre PDF descargable, via `/api/cursos/[slug]/leer`
  (proxy que nunca expone la URL de Cloudinary, dispara `Content-Disposition: attachment`).
  La persona pago por poseerlo.
- **Suscripcion activa**: si el curso tiene `content_html` cargado, `dashboard/leer/[slug]`
  renderiza ese HTML como articulo dentro de la propia UI (sanitizado con `sanitize-html`,
  ver `src/lib/sanitize.ts`) — nunca se ofrece descarga. Si el curso todavia no tiene
  `content_html` (migracion en curso), se cae al comportamiento viejo: el mismo PDF pero
  embebido inline en un iframe. El chequeo de acceso (compra aprobada o suscripcion activa)
  se hace en el propio server component antes de renderizar.

El campo se carga desde el panel admin (`/admin/courses/new` y `/admin/courses/[id]/edit`,
textarea de HTML crudo). Los 9 cursos existentes al momento de este cambio se migraron a partir
del `.html` fuente que ya existia en `/cursos/<categoria>/<slug>.html` para 8 de los 9 (el mismo
que se usa para generar el PDF — ver convencion en `TASKS.md`), limpiado con un script para sacar
el markup de impresion (portada, indice, CSS de paginado) y quedarse solo con el contenido. El
noveno curso (`estudiar-con-ia-notebooklm-claude-nano-banana`) no tenia `.html` fuente guardado,
asi que su `content_html` se reconstruyo extrayendo el texto directamente del PDF. Si se edita el
contenido de un curso a futuro, conviene actualizar el `.html` fuente en `/cursos` y regenerar
tanto el PDF (Cloudinary) como el `content_html` (Supabase) desde ahi, para que no queden
desincronizados.

## RLS (Row Level Security)
Todas las tablas tienen RLS activado. Política general:
- `courses`: lectura pública si `is_active = true`; escritura solo admin.
- `purchases` / `subscriptions`: el usuario ve solo las suyas y puede insertar las suyas (`user_id = auth.uid()`); admin ve todas.
- `affiliates` / `affiliate_referrals`: el afiliado ve solo lo suyo; admin ve todo.
- `suggestions`: cualquiera puede insertar; solo admin puede leer/actualizar.

## Fix aplicado — RLS recursion (10/07/2026)
Las políticas que verificaban `role = 'admin'` con un subquery directo a `profiles`
generaban recursión infinita (error 42P17), porque consultar `profiles` disparaba
sus propias políticas, que volvían a consultar `profiles`.

Solución: función `is_admin()` con `security definer`, que bypassea RLS al chequear
el rol. Todas las políticas de tipo `*_admin_all` ahora usan `public.is_admin()`
en vez de un subquery directo.
