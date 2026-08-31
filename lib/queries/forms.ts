import { createClient } from "@/lib/supabase/server";

export interface PendingAssignment {
  assignmentId: string;
  formCode: string;
  formTitle: string;
  formDescription: string | null;
  evaluateeName: string;
}

// "My Forms": an assignment shows here only while a form_assignments row exists
// for the user in the active cycle with NO attached submission (spec §5).
export async function getMyPendingForms(
  cycleId: string,
): Promise<PendingAssignment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("my_assignments_view")
    .select(
      "assignment_id, form_code, form_title, form_description, evaluatee_name, submission_id",
    )
    .eq("cycle_id", cycleId);

  return (data ?? [])
    .filter((row) => row.submission_id === null && row.assignment_id !== null)
    .map((row) => ({
      assignmentId: row.assignment_id ?? "",
      formCode: row.form_code ?? "",
      formTitle: row.form_title ?? "",
      formDescription: row.form_description,
      evaluateeName: row.evaluatee_name ?? "",
    }));
}

export interface ScaleOption {
  optionKey: string;
  weightPercent: number;
  displayOrder: number;
}

export interface FormQuestion {
  id: string;
  orderIndex: number;
  prompt: string;
  kind: "likert" | "scale" | "text" | "choice";
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
