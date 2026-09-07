-- 0014 — self-evaluation (revision001.md).
--
-- Every user (encrypt / officer / president) fills a self-evaluation whose
-- questions mirror the form used to evaluate their role. Modeled as SEPARATE
-- tables so form_assignments' `no_self_evaluation` check and the alias-invariant
-- `officer_results_view` are left completely untouched. Self scores are visible
-- only to the user themselves and to admins (the admin compilation).
--
-- `forms.is_self_evaluation` is declared in 0004.

-- ── self_submissions / self_answers ─────────────────────────────────────────
create table self_submissions (
  id           uuid primary key default gen_random_uuid(),
  cycle_id     uuid not null references evaluation_cycles(id) on delete cascade,
  form_id      uuid not null references forms(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  status       text not null default 'draft'
               check (status in ('draft', 'submitted')),
  unique (cycle_id, form_id, user_id)
);
create index self_submissions_user_idx on self_submissions (user_id, cycle_id);

create table self_answers (
  id                 uuid primary key default gen_random_uuid(),
  self_submission_id uuid not null references self_submissions(id) on delete cascade,
  question_id        uuid not null references form_questions(id) on delete restrict,
  value_numeric      numeric,
  value_text         text,
  unique (self_submission_id, question_id)
);
create index self_answers_submission_idx on self_answers (self_submission_id);

-- ── RLS: a user manages only their own self-evaluation ──────────────────────
alter table self_submissions enable row level security;
alter table self_answers     enable row level security;

create policy self_submissions_own_select on self_submissions
  for select using (user_id = auth.uid());
create policy self_submissions_own_insert on self_submissions
  for insert with check (user_id = auth.uid());
create policy self_submissions_own_update on self_submissions
  for update using (user_id = auth.uid() and status = 'draft');
create policy self_submissions_admin_read on self_submissions
  for select using (current_app_role() = 'admin');

create policy self_answers_own_select on self_answers
  for select using (exists (
    select 1 from self_submissions ss
    where ss.id = self_answers.self_submission_id and ss.user_id = auth.uid()
  ));
create policy self_answers_own_insert on self_answers
  for insert with check (exists (
    select 1 from self_submissions ss
    where ss.id = self_submission_id
      and ss.user_id = auth.uid() and ss.status = 'draft'
  ));
create policy self_answers_own_update on self_answers
  for update using (exists (
    select 1 from self_submissions ss
    where ss.id = self_answers.self_submission_id
      and ss.user_id = auth.uid() and ss.status = 'draft'
  ));
create policy self_answers_admin_read on self_answers
  for select using (current_app_role() = 'admin');

-- ── on-demand score aggregation (mirrors submission_scores, plus 0–4) ───────
create materialized view self_submission_scores as
select
  ss.id                          as self_submission_id,
  ss.user_id,
  sum(rso.weight_percent)        as total_sum,
  avg(rso.weight_percent) / 25.0 as normalized_score  -- 0..100 -> 0..4
from self_submissions ss
join self_answers a on a.self_submission_id = ss.id
join form_questions fq on fq.id = a.question_id and fq.kind = 'likert'
join forms f on f.id = ss.form_id
join rating_scale_options rso
  on rso.scale_key = f.rating_scale_key and rso.option_key = a.value_text
where ss.status = 'submitted'
group by ss.id, ss.user_id;

create unique index self_submission_scores_pk
  on self_submission_scores (self_submission_id);
revoke select on self_submission_scores from authenticated, anon;

-- ── the user's own pending/complete self-evaluation for the active cycle ────
-- definer rights + security_barrier, self-scoped to auth.uid(), mirroring
-- my_assignments_view. Exactly one row: the self form matching the caller's role.
create view my_self_evaluations_view with (security_barrier = true) as
select
  f.id             as form_id,
  f.code           as form_code,
  f.title          as form_title,
  f.description    as form_description,
  f.rating_scale_key,
  c.id             as cycle_id,
  ss.id            as self_submission_id,
  ss.status        as submission_status
from forms f
cross join evaluation_cycles c
left join self_submissions ss
  on ss.form_id = f.id and ss.cycle_id = c.id and ss.user_id = auth.uid()
where f.is_self_evaluation
  and f.is_active
  and c.is_active
  and f.evaluatee_role = current_app_role();

grant select on my_self_evaluations_view to authenticated;
