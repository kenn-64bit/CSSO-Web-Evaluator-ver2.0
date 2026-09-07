import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/lib/auth/roles";
import {
  blendFinalScore,
  evaluationBand,
  normalizeWeightAverage,
  type ResultSourceKey,
  type WeightTable,
} from "@/lib/scoring";

// Admin-only per-person compilation (revision001.md). One row per officer /
// encrypt under their per-cycle alias, blending self / officer / encrypt
// category averages into a final 0–4 score + textual band.
//
// Flat reads joined in memory via the service-role client, matching
// lib/queries/adminResults.ts. Callers MUST have passed requireRole('admin').

export interface CompilationRow {
  userId: string;
  aliasCode: string;
  fullName: string;
  role: AppRole;
  selfScore: number | null;
  officerScore: number | null;
  encryptScore: number | null;
  finalScore: number | null;
  band: string | null;
}

const AVERAGE = (xs: number[]) =>
  xs.length === 0 ? null : xs.reduce((a, b) => a + b, 0) / xs.length;

export async function getCompilation(): Promise<CompilationRow[]> {
  const db = createAdminClient();

  const { data: cycle } = await db
    .from("evaluation_cycles")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();
  if (!cycle) return [];

  const [
    { data: profiles },
    { data: roster },
    { data: aliases },
    { data: assignments },
    { data: forms },
    { data: submissions },
    { data: answers },
    { data: questions },
    { data: options },
    { data: selfSubs },
    { data: selfAnswers },
    { data: weights },
  ] = await Promise.all([
    db.from("profiles").select("id, role, roster_id"),
    db.from("roster").select("id, full_name"),
    db.from("aliases").select("user_id, alias_code").eq("cycle_id", cycle.id),
    db
      .from("form_assignments")
      .select("id, form_id, evaluatee_id")
      .eq("cycle_id", cycle.id),
    db.from("forms").select("id, evaluator_role, rating_scale_key, is_self_evaluation"),
    db.from("submissions").select("id, assignment_id, status"),
    db.from("answers").select("submission_id, question_id, value_text"),
    db.from("form_questions").select("id, kind"),
    db.from("rating_scale_options").select("scale_key, option_key, weight_percent"),
    db
      .from("self_submissions")
      .select("id, user_id, form_id, status")
      .eq("cycle_id", cycle.id),
    db.from("self_answers").select("self_submission_id, question_id, value_text"),
    db.from("result_weights").select("evaluatee_role, source_key, weight"),
  ]);

  const rosterById = new Map((roster ?? []).map((r) => [r.id, r.full_name]));
  const aliasByUser = new Map((aliases ?? []).map((a) => [a.user_id, a.alias_code]));
  const formById = new Map((forms ?? []).map((f) => [f.id, f]));
  const assignmentById = new Map((assignments ?? []).map((a) => [a.id, a]));
  const likertIds = new Set(
    (questions ?? []).filter((q) => q.kind === "likert").map((q) => q.id),
  );
  const weightByScaleOption = new Map(
    (options ?? []).map((o) => [`${o.scale_key}:${o.option_key}`, o.weight_percent]),
  );

  const weightTable = {} as WeightTable;
  for (const w of weights ?? []) {
    const role = w.evaluatee_role as AppRole;
    (weightTable[role] ??= {})[w.source_key as ResultSourceKey] = w.weight;
  }

  // A submission's normalized (0–4) score = normalize(avg of its likert weights).
  const submittedById = new Map(
    (submissions ?? [])
      .filter((s) => s.status === "submitted")
      .map((s) => [s.id, s]),
  );
  const answersBySubmission = new Map<string, string[]>();
  for (const a of answers ?? []) {
    if (!likertIds.has(a.question_id) || a.value_text === null) continue;
    const list = answersBySubmission.get(a.submission_id) ?? [];
    list.push(a.value_text);
    answersBySubmission.set(a.submission_id, list);
  }

  const normFromKeys = (scaleKey: string | null, keys: string[]): number | null => {
    if (!scaleKey || keys.length === 0) return null;
    const w = keys.map((k) => weightByScaleOption.get(`${scaleKey}:${k}`));
    if (w.some((x) => x === undefined)) return null;
    return normalizeWeightAverage(
      (w as number[]).reduce((a, b) => a + b, 0) / w.length,
    );
  };

  // evaluatee -> source ('officer' | 'encrypt') -> list of per-submission norms
  const peer = new Map<string, Map<ResultSourceKey, number[]>>();
  for (const [subId, sub] of submittedById) {
    const assignment = assignmentById.get(sub.assignment_id);
    if (!assignment) continue;
    const form = formById.get(assignment.form_id);
    if (!form || form.is_self_evaluation) continue;
    const source = form.evaluator_role as ResultSourceKey;
    if (source !== "officer" && source !== "encrypt") continue;
    const norm = normFromKeys(
      form.rating_scale_key,
      answersBySubmission.get(subId) ?? [],
    );
    if (norm === null) continue;
    const bySource = peer.get(assignment.evaluatee_id) ?? new Map();
    bySource.set(source, [...(bySource.get(source) ?? []), norm]);
    peer.set(assignment.evaluatee_id, bySource);
  }

  // self-evaluation norms per user
  const selfAnswersBySub = new Map<string, string[]>();
  for (const a of selfAnswers ?? []) {
    if (!likertIds.has(a.question_id) || a.value_text === null) continue;
    const list = selfAnswersBySub.get(a.self_submission_id) ?? [];
    list.push(a.value_text);
    selfAnswersBySub.set(a.self_submission_id, list);
  }
  const selfByUser = new Map<string, number>();
  for (const ss of selfSubs ?? []) {
    if (ss.status !== "submitted") continue;
    const form = formById.get(ss.form_id);
    const norm = normFromKeys(
      form?.rating_scale_key ?? null,
      selfAnswersBySub.get(ss.id) ?? [],
    );
    if (norm !== null) selfByUser.set(ss.user_id, norm);
  }

  const rows: CompilationRow[] = (profiles ?? [])
    .filter((p) => p.role === "officer" || p.role === "encrypt")
    .map((p) => {
      const role = p.role as AppRole;
      const bySource = peer.get(p.id);
      const selfScore = selfByUser.get(p.id) ?? null;
      const officerScore = AVERAGE(bySource?.get("officer") ?? []);
      const encryptScore = AVERAGE(bySource?.get("encrypt") ?? []);
      const finalScore = blendFinalScore(
        role,
        { self: selfScore, officer: officerScore, encrypt: encryptScore },
        weightTable,
      );
      return {
        userId: p.id,
        aliasCode: aliasByUser.get(p.id) ?? "—",
        fullName: rosterById.get(p.roster_id) ?? "(unknown)",
        role,
        selfScore,
        officerScore,
        encryptScore,
        finalScore,
        band: evaluationBand(finalScore),
      };
    })
    .sort((a, b) => a.aliasCode.localeCompare(b.aliasCode));

  return rows;
}
