import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { APP_ROLES, type AppRole } from "@/lib/auth/roles";
import type { FormQuestion, ScaleOption } from "@/lib/queries/forms";

// Read-only inspector for admins: every form definition, its questions, and the
// weighted rating scale that scores it (spec §5, architecture §10 — form
// definitions and weights are edited in Supabase Studio, never in-app).
// Callers MUST have already passed requireRole('admin').
//
// Flat reads joined in memory, matching lib/queries/adminResults.ts.

export interface AdminFormRow {
  id: string;
  code: string;
  title: string;
  description: string | null;
  evaluatorRole: AppRole;
  evaluateeRole: AppRole;
  resultsVisibleToEvaluatee: boolean;
  isActive: boolean;
  ratingScaleKey: string | null;
  questions: FormQuestion[];
  scaleOptions: ScaleOption[];
}

export interface RatingScaleSummary {
  key: string;
  label: string;
  options: ScaleOption[];
  usedByFormCodes: string[];
}

// Forms are browsed by the role that fills them out: one collapsible section per
// evaluator role (spec §5 "diagram 4"). Each group carries only the rating
// scale(s) its own forms reference — there is no global scale list.
export interface AdminFormGroup {
  evaluatorRole: AppRole;
  forms: AdminFormRow[];
  scales: RatingScaleSummary[];
}

export interface AdminFormsData {
  groups: AdminFormGroup[];
}

export async function getAllFormsWithScoring(): Promise<AdminFormsData> {
  const db = createAdminClient();

  const [{ data: forms }, { data: questions }, { data: scales }, { data: options }] =
    await Promise.all([
      db
        .from("forms")
        .select(
          "id, code, title, description, evaluator_role, evaluatee_role, results_visible_to_evaluatee, is_active, rating_scale_key",
        )
        .order("code", { ascending: true }),
      db
        .from("form_questions")
        .select("id, form_id, order_index, prompt, kind, is_required")
        .order("order_index", { ascending: true }),
      db.from("rating_scales").select("key, label").order("key", { ascending: true }),
      db
        .from("rating_scale_options")
        .select("scale_key, option_key, weight_percent, display_order")
        .order("display_order", { ascending: true }),
    ]);

  const questionsByForm = new Map<string, FormQuestion[]>();
  for (const q of questions ?? []) {
    const list = questionsByForm.get(q.form_id) ?? [];
    list.push({
      id: q.id,
      orderIndex: q.order_index,
      prompt: q.prompt,
      kind: q.kind as FormQuestion["kind"],
      isRequired: q.is_required,
    });
    questionsByForm.set(q.form_id, list);
  }

  const optionsByScale = new Map<string, ScaleOption[]>();
  for (const o of options ?? []) {
    const list = optionsByScale.get(o.scale_key) ?? [];
    list.push({
      optionKey: o.option_key,
      weightPercent: o.weight_percent,
      displayOrder: o.display_order,
    });
    optionsByScale.set(o.scale_key, list);
  }

  const formRows: AdminFormRow[] = (forms ?? []).map((f) => ({
    id: f.id,
    code: f.code,
    title: f.title,
    description: f.description,
    evaluatorRole: f.evaluator_role,
    evaluateeRole: f.evaluatee_role,
    resultsVisibleToEvaluatee: f.results_visible_to_evaluatee,
    isActive: f.is_active,
    ratingScaleKey: f.rating_scale_key,
    questions: questionsByForm.get(f.id) ?? [],
    scaleOptions: f.rating_scale_key
      ? optionsByScale.get(f.rating_scale_key) ?? []
      : [],
  }));

  const scalesByKey = new Map((scales ?? []).map((s) => [s.key, s]));

  // Bucket forms by evaluator role, in the canonical role order, dropping roles
  // with no forms. Each group's scale summaries cover only its own forms.
  const groups: AdminFormGroup[] = APP_ROLES.map((role) => {
    const groupForms = formRows.filter((f) => f.evaluatorRole === role);
    const scaleKeys = [
      ...new Set(
        groupForms
          .map((f) => f.ratingScaleKey)
          .filter((k): k is string => k !== null),
      ),
    ];
    const groupScales: RatingScaleSummary[] = scaleKeys.map((key) => ({
      key,
      label: scalesByKey.get(key)?.label ?? key,
      options: optionsByScale.get(key) ?? [],
      usedByFormCodes: groupForms
        .filter((f) => f.ratingScaleKey === key)
        .map((f) => f.code),
    }));
    return { evaluatorRole: role, forms: groupForms, scales: groupScales };
  }).filter((g) => g.forms.length > 0);

  return { groups };
}
