create or replace function public.giup_cy_owner_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select '3d1d5844-9d7c-4749-9add-2197dc34faa6'::uuid
$$;

create or replace function public.is_giup_cy_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'fnsofphn@gmail.com',
    'namcy@gmail.com',
    'namcy102025@gmail.com'
  )
$$;
