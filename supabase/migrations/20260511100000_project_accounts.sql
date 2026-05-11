create table public.project_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_name text not null,
  project_status text not null default 'active' check (project_status in ('active', 'paused', 'archived')),
  project_type text,
  supabase_project_name text,
  supabase_project_ref text,
  supabase_url text,
  vercel_project_name text,
  vercel_url text,
  github_repo_url text,
  domain_names text[] not null default '{}',
  phone_number text,
  owner_email text,
  login_email text,
  billing_plan text,
  last_checked_on date,
  environment_notes text,
  access_notes text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index project_accounts_user_status_idx
  on public.project_accounts (user_id, project_status, updated_at desc);

create index project_accounts_user_project_idx
  on public.project_accounts (user_id, project_name);

create index project_accounts_user_supabase_idx
  on public.project_accounts (user_id, supabase_project_name);

create trigger set_project_accounts_updated_at
  before update on public.project_accounts
  for each row execute function public.set_updated_at();

alter table public.project_accounts enable row level security;

create policy "project_accounts_select_own_rows"
  on public.project_accounts for select to authenticated
  using (auth.uid() = user_id);

create policy "project_accounts_insert_own_rows"
  on public.project_accounts for insert to authenticated
  with check (auth.uid() = user_id);

create policy "project_accounts_update_own_rows"
  on public.project_accounts for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "project_accounts_delete_own_rows"
  on public.project_accounts for delete to authenticated
  using (auth.uid() = user_id);
