create table if not exists public.giup_cy_members (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  member_user_id uuid references auth.users(id) on delete set null,
  member_email text not null,
  role text not null check (role in ('owner', 'manager', 'viewer')),
  access_scope text not null default 'full' check (access_scope in ('full', 'results_only')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint giup_cy_members_owner_email_key unique (owner_user_id, member_email)
);

create table if not exists public.giup_cy_audit_logs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.giup_cy_exam_assets (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.giup_cy_exams(id) on delete cascade,
  question_id uuid references public.giup_cy_exam_questions(id) on delete cascade,
  storage_bucket text not null default 'giup-cy-assets',
  storage_path text not null,
  public_url text,
  asset_kind text not null default 'source' check (asset_kind in ('source', 'crop', 'solution', 'attachment')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint giup_cy_exam_assets_path_key unique (storage_bucket, storage_path)
);

create table if not exists public.user_subscription_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  status text not null default 'active' check (status in ('active', 'trialing', 'past_due', 'cancelled')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_subscription_plans_user_id_key unique (user_id)
);

create index if not exists giup_cy_members_email_idx on public.giup_cy_members (lower(member_email)) where is_active = true;
create index if not exists giup_cy_members_owner_idx on public.giup_cy_members (owner_user_id, role) where is_active = true;
create index if not exists giup_cy_audit_logs_owner_created_idx on public.giup_cy_audit_logs (owner_user_id, created_at desc);
create index if not exists giup_cy_exam_assets_exam_idx on public.giup_cy_exam_assets (exam_id, sort_order);
create index if not exists user_subscription_plans_user_idx on public.user_subscription_plans (user_id, status);

drop trigger if exists set_giup_cy_members_updated_at on public.giup_cy_members;
create trigger set_giup_cy_members_updated_at before update on public.giup_cy_members
for each row execute function public.set_updated_at();

drop trigger if exists set_giup_cy_exam_assets_updated_at on public.giup_cy_exam_assets;
create trigger set_giup_cy_exam_assets_updated_at before update on public.giup_cy_exam_assets
for each row execute function public.set_updated_at();

drop trigger if exists set_user_subscription_plans_updated_at on public.user_subscription_plans;
create trigger set_user_subscription_plans_updated_at before update on public.user_subscription_plans
for each row execute function public.set_updated_at();

alter table public.giup_cy_members enable row level security;
alter table public.giup_cy_audit_logs enable row level security;
alter table public.giup_cy_exam_assets enable row level security;
alter table public.user_subscription_plans enable row level security;

create or replace function public.giup_cy_owner_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.owner_user_id
  from public.giup_cy_members m
  where m.role = 'owner'
    and m.is_active = true
  order by m.created_at asc
  limit 1
$$;

create or replace function public.is_giup_cy_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.giup_cy_members m
    where m.is_active = true
      and m.role in ('owner', 'manager')
      and (
        m.member_user_id = (select auth.uid())
        or lower(m.member_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
$$;

create or replace function public.giup_cy_access_scope()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select m.access_scope
    from public.giup_cy_members m
    where m.is_active = true
      and m.role in ('owner', 'manager', 'viewer')
      and (
        m.member_user_id = (select auth.uid())
        or lower(m.member_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
    order by case m.role when 'owner' then 1 when 'manager' then 2 else 3 end
    limit 1
  ), 'none')
$$;

drop policy if exists "giup_cy_members_select_active_self" on public.giup_cy_members;
create policy "giup_cy_members_select_active_self" on public.giup_cy_members
for select to authenticated using (
  is_active = true
  and (
    member_user_id = (select auth.uid())
    or lower(member_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or public.is_giup_cy_admin()
  )
);

drop policy if exists "giup_cy_members_manage_admin" on public.giup_cy_members;
create policy "giup_cy_members_manage_admin" on public.giup_cy_members
for all to authenticated using (public.is_giup_cy_admin()) with check (public.is_giup_cy_admin());

drop policy if exists "giup_cy_audit_logs_select_admin" on public.giup_cy_audit_logs;
create policy "giup_cy_audit_logs_select_admin" on public.giup_cy_audit_logs
for select to authenticated using (public.is_giup_cy_admin());

drop policy if exists "giup_cy_audit_logs_insert_admin" on public.giup_cy_audit_logs;
create policy "giup_cy_audit_logs_insert_admin" on public.giup_cy_audit_logs
for insert to authenticated with check (public.is_giup_cy_admin());

drop policy if exists "giup_cy_exam_assets_select_active_public" on public.giup_cy_exam_assets;
create policy "giup_cy_exam_assets_select_active_public" on public.giup_cy_exam_assets
for select to anon using (
  exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.is_active = true
  )
);

drop policy if exists "giup_cy_exam_assets_select_active_authenticated" on public.giup_cy_exam_assets;
create policy "giup_cy_exam_assets_select_active_authenticated" on public.giup_cy_exam_assets
for select to authenticated using (
  public.is_giup_cy_admin()
  or exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.is_active = true
  )
);

drop policy if exists "giup_cy_exam_assets_manage_admin" on public.giup_cy_exam_assets;
create policy "giup_cy_exam_assets_manage_admin" on public.giup_cy_exam_assets
for all to authenticated using (public.is_giup_cy_admin()) with check (public.is_giup_cy_admin());

drop policy if exists "user_subscription_plans_select_own_rows" on public.user_subscription_plans;
create policy "user_subscription_plans_select_own_rows" on public.user_subscription_plans
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "user_subscription_plans_insert_own_rows" on public.user_subscription_plans;
create policy "user_subscription_plans_insert_own_rows" on public.user_subscription_plans
for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "user_subscription_plans_update_own_rows" on public.user_subscription_plans;
create policy "user_subscription_plans_update_own_rows" on public.user_subscription_plans
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

insert into public.giup_cy_members (owner_user_id, member_user_id, member_email, role, access_scope)
values
  ('3d1d5844-9d7c-4749-9add-2197dc34faa6'::uuid, '3d1d5844-9d7c-4749-9add-2197dc34faa6'::uuid, 'fnsofphn@gmail.com', 'owner', 'full'),
  ('3d1d5844-9d7c-4749-9add-2197dc34faa6'::uuid, null, 'namcy@gmail.com', 'manager', 'full'),
  ('3d1d5844-9d7c-4749-9add-2197dc34faa6'::uuid, null, 'namcy102025@gmail.com', 'manager', 'full')
on conflict (owner_user_id, member_email) do update
set
  role = excluded.role,
  access_scope = excluded.access_scope,
  is_active = true,
  updated_at = now();
