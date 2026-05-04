create table public.quick_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Ghi chú nhanh',
  body text not null,
  color text not null default 'cyan' check (color in ('cyan', 'indigo', 'rose', 'gold')),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quick_notes_user_updated_idx
  on public.quick_notes (user_id, is_pinned desc, updated_at desc);

create trigger set_quick_notes_updated_at
  before update on public.quick_notes
  for each row execute function public.set_updated_at();

alter table public.quick_notes enable row level security;

create policy "quick_notes_select_own_rows"
  on public.quick_notes for select to authenticated
  using (auth.uid() = user_id);

create policy "quick_notes_insert_own_rows"
  on public.quick_notes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "quick_notes_update_own_rows"
  on public.quick_notes for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "quick_notes_delete_own_rows"
  on public.quick_notes for delete to authenticated
  using (auth.uid() = user_id);
