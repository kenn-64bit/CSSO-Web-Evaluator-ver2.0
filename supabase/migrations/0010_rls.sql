-- 0010 — Row Level Security. Spec §6: RLS enabled on EVERY table, no
-- `using (true)` on submission data. UI/middleware are not the boundary.

alter table roster               enable row level security;
alter table profiles             enable row level security;
alter table evaluation_cycles    enable row level security;
alter table aliases              enable row level security;
alter table forms                enable row level security;
alter table form_questions       enable row level security;
alter table rating_scales        enable row level security;
alter table rating_scale_options enable row level security;
alter table form_assignments     enable row level security;
alter table submissions          enable row level security;
alter table answers              enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
create policy profiles_self on profiles
  for select using (id = auth.uid());

create policy profiles_admin_read on profiles
  for select using (current_app_role() = 'admin');

-- ── roster ──────────────────────────────────────────────────────────────────
-- Studio (service role) manages content; only admins read it in-app.
create policy roster_admin_read on roster
  for select using (current_app_role() = 'admin');

-- ── evaluation_cycles ───────────────────────────────────────────────────────
-- Every signed-in user needs to know which cycle is active.
create policy cycles_read_authenticated on evaluation_cycles
  for select to authenticated using (true);

-- ── aliases ─────────────────────────────────────────────────────────────────
-- No policy on purpose: unreachable by a direct authenticated query. The
-- officer_results_view (definer rights) is the only read path.
create policy aliases_admin_read on aliases
  for select using (current_app_role() = 'admin');

-- ── forms / form_questions ──────────────────────────────────────────────────
create policy forms_read_authenticated on forms
  for select to authenticated using (true);

create policy form_questions_read_authenticated on form_questions
  for select to authenticated using (true);

-- ── rating scales ───────────────────────────────────────────────────────────
create policy rating_scales_read_authenticated on rating_scales
  for select to authenticated using (true);

create policy rating_scale_options_read_authenticated on rating_scale_options
  for select to authenticated using (true);

-- ── form_assignments ────────────────────────────────────────────────────────
-- Evaluators see only their own assignments (row filter). The evaluator_id
-- COLUMN is additionally revoked in 0011 so an evaluatee-side path cannot read it.
create policy assignments_own on form_assignments
  for select using (evaluator_id = auth.uid());

create policy assignments_admin_read on form_assignments
  for select using (current_app_role() = 'admin');

-- ── submissions ─────────────────────────────────────────────────────────────
-- Evaluator manages their own submission row through its lifecycle.
create policy submissions_own_select on submissions
  for select using (
    exists (
      select 1 from form_assignments fa
      where fa.id = submissions.assignment_id
        and fa.evaluator_id = auth.uid()
    )
  );

create policy submissions_own_insert on submissions
  for insert with check (
    exists (
      select 1 from form_assignments fa
      where fa.id = assignment_id
        and fa.evaluator_id = auth.uid()
    )
  );

create policy submissions_own_update on submissions
  for update using (
    exists (
      select 1 from form_assignments fa
      where fa.id = submissions.assignment_id
        and fa.evaluator_id = auth.uid()
    )
  );

create policy submissions_admin_read on submissions
  for select using (current_app_role() = 'admin');

-- ── answers ─────────────────────────────────────────────────────────────────
-- Spec §6 sketch: evaluators write answers only into their own DRAFT submission.
create policy answers_own_draft_insert on answers
  for insert with check (
    exists (
      select 1 from submissions s
      join form_assignments fa on fa.id = s.assignment_id
      where s.id = submission_id
        and fa.evaluator_id = auth.uid()
        and s.status = 'draft'
    )
  );

create policy answers_own_draft_update on answers
  for update using (
    exists (
      select 1 from submissions s
      join form_assignments fa on fa.id = s.assignment_id
      where s.id = answers.submission_id
        and fa.evaluator_id = auth.uid()
        and s.status = 'draft'
    )
  );

create policy answers_own_select on answers
  for select using (
    exists (
      select 1 from submissions s
      join form_assignments fa on fa.id = s.assignment_id
      where s.id = answers.submission_id
        and fa.evaluator_id = auth.uid()
    )
  );

create policy answers_admin_read on answers
  for select using (current_app_role() = 'admin');
