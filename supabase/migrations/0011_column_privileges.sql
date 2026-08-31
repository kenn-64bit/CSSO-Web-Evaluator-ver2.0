-- 0011 — column & view privileges. Spec §6 layer 1.
--
-- Even though `assignments_own` already filters rows to the evaluator's own,
-- revoke the evaluator_id COLUMN outright so no future join path can surface it
-- to an evaluatee. Admin reads run through the service-role client, which
-- bypasses grants and RLS entirely.
revoke select (evaluator_id) on form_assignments from authenticated;
revoke select (evaluator_id) on form_assignments from anon;

-- Lock the identity-bearing base tables to direct queries. RLS already denies
-- (no permissive policy), this makes the intent explicit and defensive.
revoke select on aliases from authenticated, anon;
revoke select on submission_scores from authenticated, anon;

-- The officer's only sanctioned read path.
grant select on officer_results_view    to authenticated;
grant select on officer_results_visible to authenticated;
