-- 0013 — admin-only maintenance RPCs. Each re-checks the caller's role from
-- profiles (never trusts the client) and runs with definer rights.

-- Refresh the on-demand score aggregation (spec §5: not on every write).
create or replace function refresh_submission_scores()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_app_role() <> 'admin' then
    raise exception 'not authorized';
  end if;
  refresh materialized view concurrently submission_scores;
end;
$$;

-- Regenerate per-cycle aliases from scratch (spec §5: aliases are per cycle and
-- must be regenerated each cycle). Full rebuild — O-5 (mid-cycle roster changes)
-- is left open; re-running this is the interim answer.
create or replace function regenerate_aliases(target_cycle uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted integer;
begin
  if current_app_role() <> 'admin' then
    raise exception 'not authorized';
  end if;

  delete from aliases where cycle_id = target_cycle;

  with ordered as (
    select
      p.id as user_id,
      p.role,
      row_number() over (partition by p.role order by r.full_name) as seq
    from profiles p
    join roster r on r.id = p.roster_id
    where r.is_active
  )
  insert into aliases (cycle_id, user_id, alias_code)
  select
    target_cycle,
    o.user_id,
    upper(left(o.role::text, 3)) || lpad(o.seq::text, 3, '0')
  from ordered o;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

-- Flip the active cycle (only one may be active — see the unique index in 0003).
create or replace function set_active_cycle(target_cycle uuid, make_active boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_app_role() <> 'admin' then
    raise exception 'not authorized';
  end if;

  if make_active then
    update evaluation_cycles set is_active = false where is_active;
  end if;
  update evaluation_cycles set is_active = make_active where id = target_cycle;
end;
$$;

revoke all on function refresh_submission_scores()          from public;
revoke all on function regenerate_aliases(uuid)             from public;
revoke all on function set_active_cycle(uuid, boolean)      from public;
grant execute on function refresh_submission_scores()       to authenticated;
grant execute on function regenerate_aliases(uuid)          to authenticated;
grant execute on function set_active_cycle(uuid, boolean)   to authenticated;
