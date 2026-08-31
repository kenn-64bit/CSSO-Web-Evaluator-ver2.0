-- 0002 — identity tables. Spec §5.
-- roster: source of truth for who may log in (edited by non-devs in Studio).
-- profiles: the subset who have actually signed in; role denormalized for RLS.

create table roster (
  id          uuid primary key default gen_random_uuid(),
  email       citext unique not null,
  full_name   text not null,
  role        app_role not null,
  department  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint roster_email_domain check (email like '%@cvsu.edu.ph')
);

create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  roster_id  uuid not null references roster(id) on delete restrict,
  email      citext not null,
  role       app_role not null,
  created_at timestamptz not null default now(),
  -- Spec §4: the SECOND, independent domain check. The auth callback is the
  -- first; this one also covers Studio / direct API inserts.
  constraint profiles_email_domain check (email like '%@cvsu.edu.ph')
);

create index profiles_roster_id_idx on profiles (roster_id);

-- Spec §5: keep profiles.role / .email in sync when the roster row changes.
create or replace function sync_profile_from_roster()
returns trigger
language plpgsql
as $$
begin
  update profiles p
     set role = new.role,
         email = new.email
   where p.roster_id = new.id;
  return new;
end;
$$;

create trigger roster_sync_profile
after update of role, email on roster
for each row
execute function sync_profile_from_roster();
