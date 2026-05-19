create or replace function public.giup_cy_owner_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.user_id
  from public.profiles p
  where lower(p.email) = 'fnsofphn@gmail.com'
  limit 1
$$;

create or replace function public.is_giup_cy_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in ('fnsofphn@gmail.com', 'namcy@gmail.com')
$$;

create policy "giup_cy_exams_select_owner_co_admin_rows" on public.giup_cy_exams
for select to authenticated using (
  public.is_giup_cy_admin()
  and user_id = public.giup_cy_owner_user_id()
);

create policy "giup_cy_exams_insert_owner_co_admin_rows" on public.giup_cy_exams
for insert to authenticated with check (
  public.is_giup_cy_admin()
  and user_id = public.giup_cy_owner_user_id()
);

create policy "giup_cy_exams_update_owner_co_admin_rows" on public.giup_cy_exams
for update to authenticated using (
  public.is_giup_cy_admin()
  and user_id = public.giup_cy_owner_user_id()
) with check (
  public.is_giup_cy_admin()
  and user_id = public.giup_cy_owner_user_id()
);

create policy "giup_cy_exams_delete_owner_co_admin_rows" on public.giup_cy_exams
for delete to authenticated using (
  public.is_giup_cy_admin()
  and user_id = public.giup_cy_owner_user_id()
);

create policy "giup_cy_exam_questions_select_owner_co_admin_rows" on public.giup_cy_exam_questions
for select to authenticated using (
  public.is_giup_cy_admin()
  and exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = public.giup_cy_owner_user_id()
  )
);

create policy "giup_cy_exam_questions_insert_owner_co_admin_rows" on public.giup_cy_exam_questions
for insert to authenticated with check (
  public.is_giup_cy_admin()
  and exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = public.giup_cy_owner_user_id()
  )
);

create policy "giup_cy_exam_questions_update_owner_co_admin_rows" on public.giup_cy_exam_questions
for update to authenticated using (
  public.is_giup_cy_admin()
  and exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = public.giup_cy_owner_user_id()
  )
) with check (
  public.is_giup_cy_admin()
  and exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = public.giup_cy_owner_user_id()
  )
);

create policy "giup_cy_exam_questions_delete_owner_co_admin_rows" on public.giup_cy_exam_questions
for delete to authenticated using (
  public.is_giup_cy_admin()
  and exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = public.giup_cy_owner_user_id()
  )
);

create policy "giup_cy_exam_attempts_select_owner_co_admin_rows" on public.giup_cy_exam_attempts
for select to authenticated using (
  public.is_giup_cy_admin()
  and exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = public.giup_cy_owner_user_id()
  )
);

create policy "giup_cy_exam_attempts_delete_owner_co_admin_rows" on public.giup_cy_exam_attempts
for delete to authenticated using (
  public.is_giup_cy_admin()
  and exists (
    select 1 from public.giup_cy_exams e
    where e.id = exam_id and e.user_id = public.giup_cy_owner_user_id()
  )
);
