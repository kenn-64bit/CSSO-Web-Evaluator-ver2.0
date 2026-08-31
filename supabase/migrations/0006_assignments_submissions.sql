-- 0006 — assignments, submissions, answers. Spec §5.
-- form_assignments is the source of truth for WHO evaluates WHOM.

create table form_assignments (
  id           uuid primary key default gen_random_uuid(),
  cycle_id     uuid not null references evaluation_cycles(id) on delete cascade,
  form_id      uuid not null references forms(id) on delete cascade,
  evaluator_id uuid not null references profiles(id) on delete cascade,
  evaluatee_id uuid not null references profiles(id) on delete cascade,
  unique (cycle_id, form_id, evaluator_id, evaluatee_id),
  constraint no_self_evaluation check (evaluator_id <> evaluatee_id)
);

create index form_assignments_evaluator_idx on form_assignments (evaluator_id, cycle_id);
create index form_assignments_evaluatee_idx on form_assignments (evaluatee_id, cycle_id);

create table submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references form_assignments(id) on delete cascade,
  submitted_at  timestamptz not null default now(),
  status        text not null default 'submitted'
                check (status in ('draft', 'submitted'))
);

create table answers (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  question_id   uuid not null references form_questions(id) on delete restrict,
  value_numeric numeric,
  value_text    text,
  unique (submission_id, question_id)
);

create index answers_submission_idx on answers (submission_id);
