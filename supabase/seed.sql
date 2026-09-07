-- seed.sql — form catalog (revision001.md) + scales + one active cycle + a
-- handful of roster rows for local development. Applied by `supabase db reset`.

-- ── Rating scales ───────────────────────────────────────────────────────────
-- N_O = not observed. 1..4 map to 10/30/60/100 percent; a submission's raw score
-- is the sum, normalized to 0–4 as avg(weight_percent)/25 for the bands.
insert into rating_scales (key, label) values
  ('encrypt_default', 'Encrypt form scale'),
  ('officer_default', 'Officer form scale');

insert into rating_scale_options (scale_key, option_key, weight_percent, display_order) values
  ('encrypt_default', 'N_O', 0,   0),
  ('encrypt_default', '1',   10,  1),
  ('encrypt_default', '2',   30,  2),
  ('encrypt_default', '3',   60,  3),
  ('encrypt_default', '4',   100, 4),
  ('officer_default', 'N_O', 0,   0),
  ('officer_default', '1',   10,  1),
  ('officer_default', '2',   30,  2),
  ('officer_default', '3',   60,  3),
  ('officer_default', '4',   100, 4);

-- ── Forms ───────────────────────────────────────────────────────────────────
-- Peer / cross-role forms (assignment-driven) + one self-evaluation per role.
-- results_visible_to_evaluatee:
--   ENCRYPT_TO_OFFICER, OFFICER_TO_OFFICER -> true  (officer is the evaluatee; O-1)
--   everything else                        -> false (admin-only / no dashboard)
-- REV-1: the revision specifies question sets only for encrypts and officers;
-- president-evaluatee forms reuse the officer instrument + scale.
insert into forms (code, title, description, evaluator_role, evaluatee_role, results_visible_to_evaluatee, rating_scale_key, is_self_evaluation) values
  ('ENCRYPT_TO_ENCRYPT',   'Fellow encrypt evaluation',      'Encrypt evaluates a fellow encrypt.', 'encrypt',   'encrypt',   false, 'encrypt_default', false),
  ('ENCRYPT_TO_OFFICER',   'Officer / chairperson evaluation','Encrypt evaluates an officer.',       'encrypt',   'officer',   true,  'officer_default', false),
  ('OFFICER_TO_ENCRYPT',   'Committee encrypt evaluation',    'Officer evaluates an encrypt.',       'officer',   'encrypt',   false, 'encrypt_default', false),
  ('OFFICER_TO_OFFICER',   'Fellow officer evaluation',       'Officer evaluates a fellow officer.', 'officer',   'officer',   true,  'officer_default', false),
  ('OFFICER_TO_PRESIDENT', 'Officer evaluation of president', 'Officer evaluates the president.',    'officer',   'president', false, 'officer_default', false),
  ('ENCRYPT_SELF',         'Encrypt self-evaluation',         'Rate your own performance this cycle.', 'encrypt', 'encrypt',   false, 'encrypt_default', true),
  ('OFFICER_SELF',         'Officer self-evaluation',          'Rate your own performance this cycle.', 'officer', 'officer',   false, 'officer_default', true),
  ('PRESIDENT_SELF',       'President self-evaluation',         'Rate your own performance this cycle.', 'president','president', false, 'officer_default', true);

-- ── Questions ───────────────────────────────────────────────────────────────
-- Encrypt instrument (5) — every form whose evaluatee is an encrypt.
insert into form_questions (form_id, order_index, prompt, kind, is_required)
select f.id, q.order_index, q.prompt, 'likert', true
from forms f
cross join (values
  (0, 'Responsibility — is the encrypt responsible?'),
  (1, 'Participation — does the encrypt actively contribute to team discussions and activities?'),
  (2, 'Communication — does the encrypt communicate clearly and effectively with others?'),
  (3, 'Teamwork — does the encrypt collaborate well and support team goals?'),
  (4, 'Conduct — does the encrypt demonstrate professional and ethical behavior?')
) as q(order_index, prompt)
where f.evaluatee_role = 'encrypt';

-- Officer instrument (6) — every form whose evaluatee is an officer or president.
insert into form_questions (form_id, order_index, prompt, kind, is_required)
select f.id, q.order_index, q.prompt, 'likert', true
from forms f
cross join (values
  (0, 'Role and Responsibility Fulfillment'),
  (1, 'Coordination and Communication'),
  (2, 'Leadership and Support'),
  (3, 'Initiative and Contribution'),
  (4, 'Accountability and Decision-Making'),
  (5, 'Growth and Integrity')
) as q(order_index, prompt)
where f.evaluatee_role in ('officer', 'president');

-- ── Active cycle ────────────────────────────────────────────────────────────
insert into evaluation_cycles (name, opens_at, closes_at, is_active) values
  ('AY 2026-2027 1st Sem', now() - interval '7 days', now() + interval '30 days', true);

-- ── Local-dev roster (real sign-in requires these emails to exist here) ──────
insert into roster (email, full_name, role, is_active) values
  ('kenn.jarangue@cvsu.edu.ph',        'Kenn Jarangue',         'admin',     true),
  ('jonmer.evangelista@cvsu.edu.ph',   'Jonmer Evangelista',    'officer',   true),
  ('macielito.devera@cvsu.edu.ph',     'Ma. Cielito De VERA',   'officer',   true),
  ('mikeangelo.metillo@cvsu.edu.ph',   'Angelo Metillo',        'officer',   true),
  ('roedwilm.balecha@cvsu.edu.ph',     'Roedwilm Balecha',      'officer',   true),
  ('rosejean.gloriani@cvsu.edu.ph',    'Rosejean Gloriani',     'officer',   true),
  ('roiseivan.mendoza@cvsu.edu.ph',    'Roise Ivan Mendoza',    'officer',   true),
  ('kurtramsher.lacro@cvsu.edu.ph',    'Kurt Lacro',            'officer',   true),
  ('cynellealexa.maranan@cvsu.edu.ph', 'Cynelle Alexa Maranan', 'officer',   true),
  ('nichole.martin@cvsu.edu.ph',       'Nichole Martin',        'officer',   true),
  ('alexie.tagotong@cvsu.edu.ph',      'Alexie Tagotong',       'president', true);
