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
| category | text | ajedrez, programacion_ia, estudio_ia, ingles, entrevistas |
| price | numeric(10,2) | precio individual |
| access_type | text | 'individual' \| 'subscription_only' \| 'both' |
| resource_url | text | link Cloudinary al PDF/curso |
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
| commission_rate | numeric(5,2) | % pendiente definir negocio |
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

## RLS (Row Level Security)
Todas las tablas tienen RLS activado. Política general:
- `courses`: lectura pública si `is_active = true`; escritura solo admin.
- `purchases` / `subscriptions`: el usuario ve solo las suyas; admin ve todas.
- `affiliates` / `affiliate_referrals`: el afiliado ve solo lo suyo; admin ve todo.
- `suggestions`: cualquiera puede insertar; solo admin puede leer/actualizar.
