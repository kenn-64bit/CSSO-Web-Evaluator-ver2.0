-- seed.sql — the six form definitions (spec §5) + scales + one active cycle +
-- a handful of roster rows for local development. Applied by `supabase db reset`.

-- ── Rating scales ───────────────────────────────────────────────────────────
insert into rating_scales (key, label) values
  ('employee_default',  'Employee form scale'),
  ('officer_default',   'Officer form scale'),
  ('executive_default', 'Executive form scale');

insert into rating_scale_options (scale_key, option_key, weight_percent, display_order) values
  ('employee_default',  'N_O', 0,   0),
  ('employee_default',  '1',   10,  1),
  ('employee_default',  '2',   30,  2),
  ('employee_default',  '3',   60,  3),
  ('employee_default',  '4',   100, 4),
  ('officer_default',   'N_O', 0,   0),
  ('officer_default',   '1',   10,  1),
  ('officer_default',   '2',   30,  2),
  ('officer_default',   '3',   60,  3),
  ('officer_default',   '4',   100, 4),
  ('executive_default', 'N_O', 0,   0),
  ('executive_default', '1',   10,  1),
  ('executive_default', '2',   30,  2),
  ('executive_default', '3',   60,  3),
  ('executive_default', '4',   100, 4);

-- ── Forms (diagram 4) ───────────────────────────────────────────────────────
-- results_visible_to_evaluatee:
--   EMP_TO_OFFICER, OFFICER_TO_OFFICER -> true  (officer is the evaluatee; O-1)
--   EMP_TO_EMP                         -> false (O-4: admin-only)
--   *_TO_PRESIDENT, EXEC_TO_PRESIDENT  -> false (O-2: no president/exec dashboard)
insert into forms (code, title, description, evaluator_role, evaluatee_role, results_visible_to_evaluatee, rating_scale_key) values
  ('EMP_TO_EMP',          'Employee peer evaluation',        'Employee evaluates a fellow employee.', 'employee',  'employee',  false, 'employee_default'),
  ('EMP_TO_OFFICER',      'Employee evaluation of officer',  'Employee evaluates an officer.',        'employee',  'officer',   true,  'employee_default'),
  ('OFFICER_TO_EMP',      'Officer evaluation of employee',  'Officer evaluates an employee.',        'officer',   'employee',  false, 'officer_default'),
  ('OFFICER_TO_OFFICER',  'Officer peer evaluation',         'Officer evaluates a fellow officer.',   'officer',   'officer',   true,  'officer_default'),
  ('OFFICER_TO_PRESIDENT','Officer evaluation of president', 'Officer evaluates the president.',      'officer',   'president', false, 'officer_default'),
  ('EXEC_TO_PRESIDENT',   'Executive evaluation of president','Executive evaluates the president.',   'executive', 'president', false, 'executive_default');

-- A small, uniform question set per form: 3 likert + 1 free-text.
insert into form_questions (form_id, order_index, prompt, kind, is_required)
select f.id, q.order_index, q.prompt, q.kind, q.is_required
from forms f
cross join (values
  (0, 'Demonstrates competence in assigned responsibilities.', 'likert', true),
  (1, 'Communicates and collaborates effectively.',            'likert', true),
  (2, 'Acts with professionalism and integrity.',              'likert', true),
  (3, 'Additional comments (optional).',                       'text',   false)
) as q(order_index, prompt, kind, is_required);

-- ── Active cycle ────────────────────────────────────────────────────────────
insert into evaluation_cycles (name, opens_at, closes_at, is_active) values
  ('AY 2026-2027 1st Sem', now() - interval '7 days', now() + interval '30 days', true);

-- ── Local-dev roster (real sign-in requires these emails to exist here) ──────
insert into roster (email, full_name, role, department, is_active) values
  ('admin.evaluator@cvsu.edu.ph',  'Ada Admin',        'admin',     'MIS',        true),
  ('officer.one@cvsu.edu.ph',      'Ofelia Officer',   'officer',   'Registrar',  true),
  ('officer.two@cvsu.edu.ph',      'Oscar Officer',    'officer',   'Registrar',  true),
  ('employee.one@cvsu.edu.ph',     'Elena Employee',   'employee',  'Registrar',  true),
  ('employee.two@cvsu.edu.ph',     'Elmer Employee',   'employee',  'Registrar',  true),
  ('employee.three@cvsu.edu.ph',   'Edna Employee',    'employee',  'Registrar',  true),
  ('exec.one@cvsu.edu.ph',         'Ester Executive',  'executive', 'OP',         true),
  ('president@cvsu.edu.ph',        'Pedro President',   'president', 'OP',         true);
