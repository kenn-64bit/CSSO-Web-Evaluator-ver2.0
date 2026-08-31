-- 0005 — weighted scoring tables. Spec §5 "Weighted scoring".
-- Weights are DATA, not app constants: an admin retunes them in Studio.

create table rating_scales (
  key   text primary key,        -- 'encrypt_default', 'officer_default'
  label text not null
);

create table rating_scale_options (
  scale_key      text not null references rating_scales(key) on delete cascade,
  option_key     text not null,       -- 'N_O', '1', '2', '3', '4'
  weight_percent numeric not null,
  display_order  int not null,
  primary key (scale_key, option_key)
);

-- A form's scale governs every likert question on that form (per form, not per item).
alter table forms
  add column rating_scale_key text references rating_scales(key);
