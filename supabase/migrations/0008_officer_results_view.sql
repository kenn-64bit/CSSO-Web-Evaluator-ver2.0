-- 0008 — the officer results path. Spec §6 "The alias invariant".
--
-- Layer 2 of 3: officers read ONLY through these views, which substitute
-- alias_code for every identity column. evaluator_id / email / name are never
-- projected here, and never reachable by a direct query either — SELECT on
-- `aliases` and `submissions` is not granted to `authenticated` (see 0011).
--
-- These views run with the *definer's* rights (the default, i.e. owner
-- `postgres`), so they can read `aliases` while direct access stays locked. The
-- "only my own feedback" filter is therefore enforced *inside* the view via
-- auth.uid(), not by base-table RLS. security_barrier keeps the planner from
-- pushing a user-supplied WHERE function below these filters.

create view officer_results_view with (security_barrier = true) as
select
  s.id            as submission_id,
  fa.evaluatee_id,
  fa.form_id,
  fa.cycle_id,
  al.alias_code   as evaluator_alias,
  ss.total_sum,
  s.submitted_at
from submissions s
join form_assignments fa on fa.id = s.assignment_id
join forms f on f.id = fa.form_id
join aliases al on al.user_id = fa.evaluator_id and al.cycle_id = fa.cycle_id
left join submission_scores ss on ss.submission_id = s.id
where s.status = 'submitted'
  and f.results_visible_to_evaluatee
  and fa.evaluatee_id = auth.uid();

-- O-3 default: withhold an officer's results for a (form, cycle) until at least
-- 3 submitted evaluations exist for it — a single aliased response can otherwise
-- identify its author in a small cohort. Revisit with the product owner.
create view officer_results_visible with (security_barrier = true) as
select v.*
from officer_results_view v
where (
  select count(*)
  from submissions s2
  join form_assignments fa2 on fa2.id = s2.assignment_id
  where fa2.evaluatee_id = v.evaluatee_id
    and fa2.form_id = v.form_id
    and fa2.cycle_id = v.cycle_id
    and s2.status = 'submitted'
) >= 3;
