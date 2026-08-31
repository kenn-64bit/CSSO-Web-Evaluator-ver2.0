-- 0003 — evaluation cycles and per-cycle aliases. Spec §5.
-- Aliases are scoped per cycle so an officer cannot correlate a critic across
-- cycles. Never store a stable alias on roster.

create table evaluation_cycles (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,          -- e.g. "AY 2026-2027 1st Sem"
  opens_at   timestamptz not null,
  closes_at  timestamptz not null,
  is_active  boolean not null default false
);

-- At most one active cycle at a time.
create unique index evaluation_cycles_single_active
  on evaluation_cycles ((is_active))
  where is_active;

create table aliases (
  id         uuid primary key default gen_random_uuid(),
  cycle_id   uuid not null references evaluation_cycles(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  alias_code text not null,          -- 'OFFICER01', 'EMP0042'
  unique (cycle_id, user_id),
  unique (cycle_id, alias_code)
);
