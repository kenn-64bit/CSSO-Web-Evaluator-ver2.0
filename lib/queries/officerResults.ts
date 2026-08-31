import { createClient } from "@/lib/supabase/server";

export interface OfficerResultRow {
  submissionId: string;
  formId: string;
  cycleId: string;
  evaluatorAlias: string;
  totalSum: number | null;
  submittedAt: string;
}

// Officers read EXCLUSIVELY from officer_results_visible (spec §6): evaluator
// identity is already replaced by alias_code, and the O-3 threshold (>= 3
// submissions per form+cycle) is applied inside the view. No per-answer detail.
export async function getMyOfficerResults(): Promise<OfficerResultRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("officer_results_visible")
    .select(
      "submission_id, form_id, cycle_id, evaluator_alias, total_sum, submitted_at",
    )
    .order("submitted_at", { ascending: false });

  return (data ?? [])
    .filter((row) => row.submission_id !== null)
    .map((row) => ({
      submissionId: row.submission_id ?? "",
      formId: row.form_id ?? "",
      cycleId: row.cycle_id ?? "",
      evaluatorAlias: row.evaluator_alias ?? "",
      totalSum: row.total_sum,
      submittedAt: row.submitted_at ?? "",
    }));
}
