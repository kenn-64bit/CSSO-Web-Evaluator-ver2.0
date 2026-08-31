-- 0012 — the evaluator's own worklist.
--
-- An evaluator must see WHO they evaluate, but `profiles` / `roster` are not
-- readable by non-admins (spec §6 sketch), and `form_assignments.evaluator_id`
-- is column-revoked (0011). This definer-rights, security_barrier view is the
-- single sanctioned read path for "My Forms" and the form detail page: it is
-- self-scoped to auth.uid() as the evaluator and never projects evaluator_id.

create view my_assignments_view with (security_barrier = true) as
select
  fa.id                as assignment_id,
  fa.cycle_id,
  fa.form_id,
  f.code               as form_code,
  f.title              as form_title,
  f.description        as form_description,
  f.rating_scale_key,
  r.full_name          as evaluatee_name,
  f.evaluatee_role,
  s.id                 as submission_id,
  s.status             as submission_status
from form_assignments fa
join forms f     on f.id = fa.form_id
join profiles p  on p.id = fa.evaluatee_id
join roster r    on r.id = p.roster_id
left join submissions s on s.assignment_id = fa.id
where fa.evaluator_id = auth.uid();

grant select on my_assignments_view to authenticated;
