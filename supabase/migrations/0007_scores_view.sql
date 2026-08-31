-- 0007 — on-demand aggregation. Spec §2 / §5: a materialized view, not a worker.
-- Refresh after cycle close or via a scheduled function, not on every write.

create materialized view submission_scores as
select
  s.id as submission_id,
  sum(rso.weight_percent) as total_sum
from submissions s
join answers a on a.submission_id = s.id
join form_questions fq on fq.id = a.question_id and fq.kind = 'likert'
join form_assignments fa on fa.id = s.assignment_id
join forms f on f.id = fa.form_id
join rating_scale_options rso
  on rso.scale_key = f.rating_scale_key and rso.option_key = a.value_text
group by s.id;

-- Unique index so it can be refreshed concurrently.
create unique index submission_scores_pk on submission_scores (submission_id);
