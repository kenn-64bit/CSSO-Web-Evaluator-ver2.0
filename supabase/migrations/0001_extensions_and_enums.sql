-- 0001 — extensions and the role enum.
-- Spec §3 + revision001.md: four-value enum, non-hierarchical. Never compare
-- roles with >=. (`executive` was removed per revision001.md — architecture (1).md
-- §3 still lists it.)

create extension if not exists citext with schema public;
create extension if not exists pgcrypto with schema public; -- gen_random_uuid()

create type app_role as enum ('encrypt', 'officer', 'president', 'admin');
