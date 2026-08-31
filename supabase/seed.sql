-- seed.sql — the six form definitions (spec §5) + scales + one active cycle +
-- a handful of roster rows for local development. Applied by `supabase db reset`.

-- ── Rating scales ───────────────────────────────────────────────────────────
insert into rating_scales (key, label) values
  ('encrypt_default',   'Encrypt form scale'),
  ('officer_default',   'Officer form scale'),
  ('executive_default', 'Executive form scale');

insert into rating_scale_options (scale_key, option_key, weight_percent, display_order) values
  ('encrypt_default',   'N_O', 0,   0),
  ('encrypt_default',   '1',   10,  1),
  ('encrypt_default',   '2',   30,  2),
  ('encrypt_default',   '3',   60,  3),
  ('encrypt_default',   '4',   100, 4),
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
--   ENCRYPT_TO_OFFICER, OFFICER_TO_OFFICER -> true  (officer is the evaluatee; O-1)
--   ENCRYPT_TO_ENCRYPT                     -> false (O-4: admin-only)
--   *_TO_PRESIDENT, EXEC_TO_PRESIDENT      -> false (O-2: no president/exec dashboard)
insert into forms (code, title, description, evaluator_role, evaluatee_role, results_visible_to_evaluatee, rating_scale_key) values
  ('ENCRYPT_TO_ENCRYPT',  'Encrypt peer evaluation',         'Encrypt evaluates a fellow encrypt.',   'encrypt',   'encrypt',   false, 'encrypt_default'),
  ('ENCRYPT_TO_OFFICER',  'Encrypt evaluation of officer',   'Encrypt evaluates an officer.',         'encrypt',   'officer',   true,  'encrypt_default'),
  ('OFFICER_TO_ENCRYPT',  'Officer evaluation of encrypt',   'Officer evaluates an encrypt.',         'officer',   'encrypt',   false, 'officer_default'),
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
insert into roster (email, full_name, role, is_active) values
  ('kenn.jarangue@cvsu.edu.ph',      'Kenn Jarangue',   'admin',   true),
  ('jonmer.evangelista@cvsu.edu.ph',      'Jonmer Evangelista',   'officer',   true),
  ('macielito.devera@cvsu.edu.ph',      'Ma. Cielito De VERA',    'officer',   true),
  ('mikeangelo.metillo@cvsu.edu.ph',      'Angelo Metillo',    'officer',   true),
  ('roedwilm.balecha@cvsu.edu.ph',      'Roedwilm Balecha',    'officer',   true),
  ('rosejean.gloriani@cvsu.edu.ph',    'Rosejean Gloriani',     'officer',   true),
  ('roiseivan.mendoza@cvsu.edu.ph',         'Roise Ivan Mendoza',  'officer', true),
  ('kurtramsher.lacro@cvsu.edu.ph',        'Kurt Lacro',   'officer', true),
  ('cynellealexa.maranan@cvsu.edu.ph',  'Cynelle Alexa Maranan',   'officer', true),
  ('nichole.martin@cvsu.edu.ph',        'Nichole Martin',   'officer', true),
  ('alexie.tagotong@cvsu.edu.ph',        'Alexie Tagotong',   'president', true);