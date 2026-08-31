"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getFormForAssignment } from "@/lib/queries/forms";
import { getOrCreateDraft, markSubmitted } from "@/lib/queries/submissions";

export interface SubmitState {
  error: string | null;
}

// Spec §9: all mutations are Server Actions; user-facing errors are generic and
// never echo Postgres text.
export async function submitForm(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  await requireUser();

  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (!assignmentId) return { error: "Something went wrong. Please try again." };

  const form = await getFormForAssignment(assignmentId);
  if (!form) return { error: "This form is not available." };
  if (form.alreadySubmitted) {
    return { error: "This form has already been submitted." };
  }

  // Collect + validate answers against the form's questions.
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

    if (q.kind === "likert" || q.kind === "scale") {
      const allowed = new Set(form.scaleOptions.map((o) => o.optionKey));
      if (!allowed.has(value)) {
        return { error: "Please answer every required question." };
      }
      // Spec §5: the selected option key is stored in value_text.
      rows.push({ question_id: q.id, value_text: value, value_numeric: null });
    } else {
      rows.push({ question_id: q.id, value_text: value, value_numeric: null });
    }
  }

  const submissionId = await getOrCreateDraft(assignmentId);
  if (!submissionId) {
    return { error: "Could not start this submission. Please try again." };
  }

  const supabase = await createClient();
  const { error: answersError } = await supabase.from("answers").upsert(
    rows.map((r) => ({ ...r, submission_id: submissionId })),
    { onConflict: "submission_id,question_id" },
  );
  if (answersError) {
    return { error: "Could not save your answers. Please try again." };
  }

  const ok = await markSubmitted(submissionId);
  if (!ok) return { error: "Could not submit. Please try again." };

  revalidatePath("/forms");
  redirect(`/forms/${assignmentId}/done`);
}
