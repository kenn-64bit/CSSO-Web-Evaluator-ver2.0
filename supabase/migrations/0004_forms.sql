-- 0004 — form definitions and their questions. Spec §5.

create table forms (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,      -- 'ENCRYPT_TO_OFFICER'
  title          text not null,
  description    text,
  evaluator_role app_role not null,         -- who must fill this out
  evaluatee_role app_role not null,         -- who is being evaluated
  results_visible_to_evaluatee boolean not null default false,
  is_active      boolean not null default true
);

create table form_questions (
  id          uuid primary key default gen_random_uuid(),
  form_id     uuid not null references forms(id) on delete cascade,
  order_index int not null,
  prompt      text not null,
  kind        text not null check (kind in ('likert', 'scale', 'text', 'choice')),
  options     jsonb,                        -- for 'choice'
  is_required boolean not null default true,
  unique (form_id, order_index)
);

create index form_questions_form_id_idx on form_questions (form_id);
