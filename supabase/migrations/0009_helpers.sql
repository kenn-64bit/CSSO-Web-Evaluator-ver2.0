-- 0009 — RLS helper. Spec §6: use current_role() inside policies instead of
-- repeating the profiles subquery. stable + security definer, pinned search_path.

create or replace function current_app_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

revoke all on function current_app_role() from public;
grant execute on function current_app_role() to authenticated;
