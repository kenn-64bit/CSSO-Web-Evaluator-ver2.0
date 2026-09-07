import { createClient } from "@/lib/supabase/server";

export interface PendingForm {
  key: string;
  href: string;
  kind: "assignment" | "self";
  formCode: string;
  formTitle: string;
  formDescription: string | null;
  evaluateeName: string;
}

// "My Forms": an assignment shows here only while a form_assignments row exists
// for the user in the active cycle with NO attached submission (spec §5). The
// user's own self-evaluation (revision001.md) is merged in from a separate view
// and shows until they submit it.
export async function getMyPendingForms(
  cycleId: string,
): Promise<PendingForm[]> {
  const supabase = await createClient();

  const [{ data: assignments }, { data: self }] = await Promise.all([
    supabase
      .from("my_assignments_view")
      .select(
        "assignment_id, form_code, form_title, form_description, evaluatee_name, submission_id",
      )
      .eq("cycle_id", cycleId),
    supabase
      .from("my_self_evaluations_view")
      .select("form_id, form_code, form_title, form_description, submission_status"),
  ]);

  const pending: PendingForm[] = (assignments ?? [])
    .filter((row) => row.submission_id === null && row.assignment_id !== null)
    .map((row) => ({
      key: `assignment:${row.assignment_id}`,
      href: `/forms/${row.assignment_id}`,
      kind: "assignment" as const,
      formCode: row.form_code ?? "",
      formTitle: row.form_title ?? "",
      formDescription: row.form_description,
      evaluateeName: row.evaluatee_name ?? "",
    }));

  for (const row of self ?? []) {
    if (row.submission_status === "submitted" || !row.form_id) continue;
    pending.push({
      key: `self:${row.form_id}`,
      href: `/self/${row.form_id}`,
      kind: "self",
      formCode: row.form_code ?? "",
      formTitle: row.form_title ?? "",
      formDescription: row.form_description,
      evaluateeName: "yourself",
    });
  }

  return pending;
}

export interface ScaleOption {
  optionKey: string;
  weightPercent: number;
  displayOrder: number;
}

// Forms are rating-only (revision001.md) — no free-text input path.
export interface FormQuestion {
  id: string;
  orderIndex: number;
  prompt: string;
  kind: "likert" | "scale";
  isRequired: boolean;
}

export interface FormDetail {
  assignmentId: string;
  formTitle: string;
  formDescription: string | null;
  evaluateeName: string;
  alreadySubmitted: boolean;
  questions: FormQuestion[];
  scaleOptions: ScaleOption[];
}

export async function getFormForAssignment(
  assignmentId: string,
): Promise<FormDetail | null> {
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("my_assignments_view")
    .select(
      "assignment_id, form_id, form_title, form_description, evaluatee_name, rating_scale_key, submission_status",
    )
    .eq("assignment_id", assignmentId)
    .maybeSingle();

  if (!assignment || !assignment.assignment_id || !assignment.form_id) return null;

  const { data: questions } = await supabase
    .from("form_questions")
    .select("id, order_index, prompt, kind, is_required")
    .eq("form_id", assignment.form_id)
    .order("order_index", { ascending: true });

  let scaleOptions: ScaleOption[] = [];
  if (assignment.rating_scale_key) {
    const { data: opts } = await supabase
      .from("rating_scale_options")
      .select("option_key, weight_percent, display_order")
      .eq("scale_key", assignment.rating_scale_key)
      .order("display_order", { ascending: true });
    scaleOptions = (opts ?? []).map((o) => ({
      optionKey: o.option_key,
      weightPercent: o.weight_percent,
      displayOrder: o.display_order,
    }));
  }

  return {
    assignmentId: assignment.assignment_id,
    formTitle: assignment.form_title ?? "",
    formDescription: assignment.form_description,
    evaluateeName: assignment.evaluatee_name ?? "",
    alreadySubmitted: assignment.submission_status === "submitted",
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
