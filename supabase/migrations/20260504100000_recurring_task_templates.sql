create table public.recurring_task_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default 'Công việc',
  priority integer not null default 3 check (priority between 1 and 5),
  cadence text not null default 'monthly' check (cadence in ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  next_due_on date not null default current_date,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks
  add column source_recurring_task_id uuid references public.recurring_task_templates(id) on delete set null,
  add column recurrence_due_on date;

create unique index tasks_recurring_occurrence_key
  on public.tasks (user_id, source_recurring_task_id, recurrence_due_on)
  where source_recurring_task_id is not null and recurrence_due_on is not null;

create index recurring_task_templates_user_next_due_idx
  on public.recurring_task_templates (user_id, is_active, next_due_on);

create trigger set_recurring_task_templates_updated_at
  before update on public.recurring_task_templates
  for each row execute function public.set_updated_at();

alter table public.recurring_task_templates enable row level security;

create policy "recurring_task_templates_select_own_rows"
  on public.recurring_task_templates for select to authenticated
  using (auth.uid() = user_id);
create policy "recurring_task_templates_insert_own_rows"
  on public.recurring_task_templates for insert to authenticated
  with check (auth.uid() = user_id);

create policy "recurring_task_templates_update_own_rows"
  on public.recurring_task_templates for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "recurring_task_templates_delete_own_rows"
  on public.recurring_task_templates for delete to authenticated
  using (auth.uid() = user_id);
