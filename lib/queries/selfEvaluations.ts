import { createClient } from "@/lib/supabase/server";
import type { FormDetail, FormQuestion, ScaleOption } from "@/lib/queries/forms";

// Self-evaluation read/write path (revision001.md). Separate from the
// assignment-driven submissions path: `my_self_evaluations_view` is self-scoped
// to auth.uid() and RLS on self_submissions / self_answers keeps a user to their
// own rows.

export interface SelfFormDetail extends Omit<FormDetail, "assignmentId"> {
  formId: string;
  cycleId: string;
}

export async function getMySelfForm(): Promise<SelfFormDetail | null> {
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("my_self_evaluations_view")
    .select(
      "form_id, form_title, form_description, rating_scale_key, cycle_id, submission_status",
    )
    .maybeSingle();

  if (!row || !row.form_id || !row.cycle_id) return null;

  const { data: questions } = await supabase
    .from("form_questions")
    .select("id, order_index, prompt, kind, is_required")
    .eq("form_id", row.form_id)
    .order("order_index", { ascending: true });

  let scaleOptions: ScaleOption[] = [];
  if (row.rating_scale_key) {
    const { data: opts } = await supabase
      .from("rating_scale_options")
      .select("option_key, weight_percent, display_order")
      .eq("scale_key", row.rating_scale_key)
      .order("display_order", { ascending: true });
    scaleOptions = (opts ?? []).map((o) => ({
      optionKey: o.option_key,
      weightPercent: o.weight_percent,
      displayOrder: o.display_order,
    }));
  }

  return {
    formId: row.form_id,
    cycleId: row.cycle_id,
    formTitle: row.form_title ?? "",
    formDescription: row.form_description,
    evaluateeName: "yourself",
    alreadySubmitted: row.submission_status === "submitted",
    questions: (questions ?? []).map((q) => ({
      id: q.id,
      orderIndex: q.order_index,
      prompt: q.prompt,
      kind: q.kind as FormQuestion["kind"],
      isRequired: q.is_required,
    })),
    scaleOptions,
  };
}

// Returns the draft self_submission id, creating one if absent. RLS guarantees
// user_id = auth.uid(). Returns null if it was already submitted.
export async function getOrCreateSelfDraft(
  formId: string,
  cycleId: string,
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("self_submissions")
    .select("id, status")
    .eq("form_id", formId)
    .eq("cycle_id", cycleId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return existing.status === "draft" ? existing.id : null;
  }

  const { data: created, error } = await supabase
    .from("self_submissions")
    .insert({
      form_id: formId,
      cycle_id: cycleId,
      user_id: userId,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !created) return null;
  return created.id;
}

export async function markSelfSubmitted(selfSubmissionId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("self_submissions")
    .update({ status: "submitted" })
    .eq("id", selfSubmissionId);
  return !error;
}
