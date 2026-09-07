-- 0015 — per-person final score: form-category weights + textual bands
-- (revision001.md).
--
-- A person's final score blends three category averages (all on the 0–4 scale):
--   self  = their own self-evaluation
--   officer = average of officer-authored evaluations about them
--   encrypt = average of encrypt-authored evaluations about them
-- weighted per the table below, then mapped to a textual band.
--
-- Weights are DATA, not constants (architecture invariant): an admin retunes
-- them in Studio without a deploy.

create table result_weights (
  evaluatee_role app_role not null,
  source_key     text not null check (source_key in ('self', 'officer', 'encrypt')),
  weight         numeric not null check (weight >= 0 and weight <= 1),
  primary key (evaluatee_role, source_key)
);

insert into result_weights (evaluatee_role, source_key, weight) values
  ('officer', 'self',    0.10),
  ('officer', 'officer', 0.35),
  ('officer', 'encrypt', 0.55),
  ('encrypt', 'self',    0.10),
  ('encrypt', 'officer', 0.65),
  ('encrypt', 'encrypt', 0.25);

alter table result_weights enable row level security;
create policy result_weights_read_authenticated on result_weights
  for select to authenticated using (true);

-- Numeric 0–4 score -> textual band. Boundaries are lower-inclusive and
-- cascading (>= 3.5, >= 3.0, …); the doc's overlapping endpoints resolve upward.
create function evaluation_band(score numeric)
returns text
language sql
immutable
as $$
  select case
    when score is null      then null
    when score >= 3.5       then 'Exceeding Expectations'
    when score >= 3.0       then 'Fully Meeting Expectations'
    when score >= 2.5       then 'Mostly Meeting Expectations'
    when score >= 2.0       then 'Partially Meeting Expectations'
    when score >= 1.0       then 'Not Meeting Expectations'
    when score >= 0.5       then 'Failing to Meet Expectations'
    else                         'Unacceptable'
  end
$$;

-- (refresh_submission_scores() also refreshes self_submission_scores — see 0013.)
