-- 0001 — extensions and the role enum.
-- Spec §3: five-value enum, non-hierarchical. Never compare roles with >=.

create extension if not exists citext with schema public;
create extension if not exists pgcrypto with schema public; -- gen_random_uuid()

create type app_role as enum ('employee', 'officer', 'executive', 'president', 'admin');
