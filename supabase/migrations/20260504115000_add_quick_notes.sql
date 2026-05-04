create table if not exists public.quick_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  color text not null default 'indigo' check (color in ('cyan', 'indigo', 'rose', 'gold')),
  is_pinned boolean not null default false,
  completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quick_notes add column if not exists completed boolean not null default false;
alter table public.quick_notes add column if not exists sort_order integer not null default 0;

create index if not exists quick_notes_user_created_idx on public.quick_notes (user_id, created_at desc);
create index if not exists quick_notes_user_pinned_idx on public.quick_notes (user_id, is_pinned, created_at desc);

drop trigger if exists set_quick_notes_updated_at on public.quick_notes;
create trigger set_quick_notes_updated_at
before update on public.quick_notes
for each row execute function public.set_updated_at();

alter table public.quick_notes enable row level security;

drop policy if exists "quick_notes_select_own_rows" on public.quick_notes;
drop policy if exists "quick_notes_insert_own_rows" on public.quick_notes;
drop policy if exists "quick_notes_update_own_rows" on public.quick_notes;
drop policy if exists "quick_notes_delete_own_rows" on public.quick_notes;

create policy "quick_notes_select_own_rows"
on public.quick_notes for select
to authenticated
using (auth.uid() = user_id);

create policy "quick_notes_insert_own_rows"
on public.quick_notes for insert
to authenticated
with check (auth.uid() = user_id);

create policy "quick_notes_update_own_rows"
on public.quick_notes for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "quick_notes_delete_own_rows"
on public.quick_notes for delete
to authenticated
using (auth.uid() = user_id);
