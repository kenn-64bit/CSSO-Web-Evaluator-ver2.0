import { createClient } from "@/lib/supabase/server";

// Returns the draft submission id for an assignment, creating one if absent.
// RLS (submissions_own_insert / _select) guarantees the caller is the evaluator.
export async function getOrCreateDraft(assignmentId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("submissions")
    .select("id, status")
    .eq("assignment_id", assignmentId)
    .maybeSingle();

  if (existing) {
    // Already submitted — caller must reject; a submitted form is immutable.
    return existing.status === "draft" ? existing.id : null;
  }

  const { data: created, error } = await supabase
    .from("submissions")
    .insert({ assignment_id: assignmentId, status: "draft" })
    .select("id")
    .single();

  if (error || !created) return null;
  return created.id;
}

export async function markSubmitted(submissionId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("submissions")
    .update({ status: "submitted" })
    .eq("id", submissionId);
  return !error;
}
