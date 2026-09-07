-- 0014 — evaluations are rating-only. Remove the seeded free-text
-- "Additional comments" question from every form.
-- answers.question_id is ON DELETE RESTRICT (see 0006), so clear any dependent
-- answers before deleting the questions.

delete from answers
where question_id in (
  select id from form_questions where kind in ('text', 'choice')
);

delete from form_questions where kind in ('text', 'choice');
