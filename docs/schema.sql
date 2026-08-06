-- ============================================================
-- UpgradeLab — schema completo (recreado 24/07/2026)
-- Correr una sola vez, entero, en el SQL Editor del proyecto
-- Supabase correcto (mzylzoqmxprrigdxlwsc).
-- Basado en docs/DATABASE.md.
-- ============================================================

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Trigger: cada vez que se crea un usuario en auth.users, se crea su
-- profile automaticamente (signUp en src/lib/actions/auth.ts solo llama a
-- supabase.auth.signUp, no inserta en profiles a mano).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: el trigger de arriba solo corre para usuarios NUEVOS. Si este
-- proyecto ya tiene gente registrada de antes (auth.users no depende del
-- schema public, existen aunque las tablas se hayan borrado), esto les crea
-- el profile retroactivamente para que no queden huerfanos.
insert into public.profiles (id, full_name)
select id, raw_user_meta_data ->> 'full_name'
from auth.users
on conflict (id) do nothing;

-- Funcion security definer para chequear admin sin recursion de RLS
-- (ver docs/DATABASE.md, fix aplicado 10/07/2026: consultar profiles desde
-- una policy de profiles generaba recursion infinita 42P17).
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- courses ----------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  category text not null check (category in ('programacion_ia', 'estudio_ia', 'ingles', 'entrevistas', 'ventas_freelance')),
  price numeric(10, 2) not null,
  access_type text not null default 'individual' check (access_type in ('individual', 'subscription_only', 'both')),
  resource_url text,
  cover_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- purchases ----------
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  amount numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'refunded')),
  mp_payment_id text,
  -- Se setea la primera vez que se sirve el PDF a traves de
  -- /api/cursos/[slug]/leer. Sirve como prueba objetiva de si la persona ya
  -- accedio al contenido o no, para resolver pedidos de arrepentimiento
  -- (excepcion del art. 1116 CCyC aplica solo si ya accedio).
  first_accessed_at timestamptz,
  created_at timestamptz not null default now()
);

create index purchases_user_id_idx on public.purchases(user_id);
create index purchases_course_id_idx on public.purchases(course_id);

-- ---------- subscriptions ----------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'cancelled', 'past_due', 'paused')),
  mp_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);

-- ---------- affiliates ----------
create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  code text not null unique,
  commission_rate numeric(5, 2) not null default 40,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  -- Alias o CBU donde se le transfiere la comision. Lo carga el propio
  -- afiliado desde /dashboard/afiliados (ver policy affiliates_update_own).
  payout_alias text,
  created_at timestamptz not null default now()
);

-- ---------- affiliate_referrals ----------
create table public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  referred_user_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null check (source_type in ('purchase', 'subscription')),
  source_id uuid not null,
  commission_amount numeric(10, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  -- Cuando el admin marca la comision como pagada (pago mensual en lote, ver
  -- /admin/afiliados), se registra la fecha para tener un historial claro.
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index affiliate_referrals_affiliate_id_idx on public.affiliate_referrals(affiliate_id);

-- Si esta persona se registro a traves de un link de afiliado (?ref=CODE),
-- guardamos que afiliado la trajo. Se setea una sola vez, en el signup, con
-- el service role (bypassea RLS), y se usa despues para acreditar comision
-- cuando se le aprueba una compra o se le activa la suscripcion. Va despues
-- de la tabla affiliates porque depende de ella (orden de creacion).
alter table public.profiles
  add column referred_by_affiliate_id uuid references public.affiliates(id) on delete set null;

-- ---------- suggestions ----------
create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text,
  email text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'implemented', 'dismissed')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.purchases enable row level security;
alter table public.subscriptions enable row level security;
alter table public.affiliates enable row level security;
alter table public.affiliate_referrals enable row level security;
alter table public.suggestions enable row level security;

-- profiles: el usuario ve y edita su propio profile; admin ve todos.
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin());

-- courses: lectura publica si is_active = true; admin gestiona todo.
create policy courses_select_active on public.courses
  for select using (is_active = true);
create policy courses_admin_all on public.courses
  for all using (public.is_admin());

-- purchases: el usuario ve/inserta las suyas; admin ve todas.
create policy purchases_select_own on public.purchases
  for select using (auth.uid() = user_id);
create policy purchases_insert_own on public.purchases
  for insert with check (auth.uid() = user_id);
create policy purchases_admin_all on public.purchases
  for all using (public.is_admin());

-- subscriptions: el usuario ve/inserta las suyas; admin ve todas.
create policy subscriptions_select_own on public.subscriptions
  for select using (auth.uid() = user_id);
create policy subscriptions_insert_own on public.subscriptions
  for insert with check (auth.uid() = user_id);
create policy subscriptions_admin_all on public.subscriptions
  for all using (public.is_admin());

-- affiliates: el afiliado ve/inserta/edita lo suyo (edita para cargar su
-- alias/CBU de cobro); admin ve y edita todo (para aprobar/rechazar, etc).
create policy affiliates_select_own on public.affiliates
  for select using (auth.uid() = user_id);
create policy affiliates_insert_own on public.affiliates
  for insert with check (auth.uid() = user_id);
create policy affiliates_update_own on public.affiliates
  for update using (auth.uid() = user_id);
create policy affiliates_admin_all on public.affiliates
  for all using (public.is_admin());

-- affiliate_referrals: el afiliado ve lo suyo; admin ve todo.
create policy affiliate_referrals_select_own on public.affiliate_referrals
  for select using (
    exists (select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid())
  );
create policy affiliate_referrals_admin_all on public.affiliate_referrals
  for all using (public.is_admin());

-- suggestions: cualquiera inserta (incluso anonimo); solo admin lee/actualiza.
create policy suggestions_insert_any on public.suggestions
  for insert with check (true);
create policy suggestions_admin_all on public.suggestions
  for all using (public.is_admin());

-- ============================================================
-- Nota: para tener un usuario admin, despues de registrarte normalmente
-- desde /register, correr a mano:
--   update public.profiles set role = 'admin' where id = 'TU-USER-UUID';
-- (el UUID se ve en Authentication > Users en el dashboard de Supabase)
-- ============================================================
