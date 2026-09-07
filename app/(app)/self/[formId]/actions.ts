"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  getMySelfForm,
  getOrCreateSelfDraft,
  markSelfSubmitted,
} from "@/lib/queries/selfEvaluations";

export interface SubmitState {
  error: string | null;
}

// Self-evaluation submit (revision001.md). Mirrors the assignment submit action
// but writes to self_submissions / self_answers. Rating-only: every answer must
// be one of the form's option keys.
export async function submitSelfForm(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const user = await requireUser();

  const formId = String(formData.get("formId") ?? "");
  if (!formId) return { error: "Something went wrong. Please try again." };

  const form = await getMySelfForm();
  if (!form || form.formId !== formId) {
    return { error: "This form is not available." };
  }
  if (form.alreadySubmitted) {
    return { error: "This form has already been submitted." };
  }

  const allowed = new Set(form.scaleOptions.map((o) => o.optionKey));
  const rows: {
    question_id: string;
    value_text: string | null;
    value_numeric: number | null;
  }[] = [];

  for (const q of form.questions) {
    const raw = formData.get(`q:${q.id}`);
    const value = typeof raw === "string" ? raw.trim() : "";

    if (q.isRequired && value === "") {
      return { error: "Please answer every required question." };
    }
    if (value === "") continue;
    if (!allowed.has(value)) {
      return { error: "Please answer every required question." };
    }
    rows.push({ question_id: q.id, value_text: value, value_numeric: null });
  }

  const selfSubmissionId = await getOrCreateSelfDraft(
    form.formId,
    form.cycleId,
    user.id,
  );
  if (!selfSubmissionId) {
    return { error: "Could not start this submission. Please try again." };
  }

  const supabase = await createClient();
  const { error: answersError } = await supabase.from("self_answers").upsert(
    rows.map((r) => ({ ...r, self_submission_id: selfSubmissionId })),
    { onConflict: "self_submission_id,question_id" },
  );
  if (answersError) {
    return { error: "Could not save your answers. Please try again." };
  }

  const ok = await markSelfSubmitted(selfSubmissionId);
  if (!ok) return { error: "Could not submit. Please try again." };

  revalidatePath("/forms");
  redirect(`/self/${formId}/done`);
}
