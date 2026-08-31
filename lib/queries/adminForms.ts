import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/lib/auth/roles";
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

export interface AdminFormsData {
  forms: AdminFormRow[];
  scales: RatingScaleSummary[];
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

  const scaleSummaries: RatingScaleSummary[] = (scales ?? []).map((s) => ({
    key: s.key,
    label: s.label,
    options: optionsByScale.get(s.key) ?? [],
    usedByFormCodes: formRows
      .filter((f) => f.ratingScaleKey === s.key)
      .map((f) => f.code),
  }));

  return { forms: formRows, scales: scaleSummaries };
}
