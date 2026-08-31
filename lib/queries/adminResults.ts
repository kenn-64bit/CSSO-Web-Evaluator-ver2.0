import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Spec §6: "Admin queries run through a separate path." The admin dashboard uses
// the service-role client (bypasses RLS) and shows real identities + full text.
// Callers MUST have already passed requireRole('admin').
//
// Done as a handful of flat reads joined in memory rather than one deep nested
// select — keeps it type-safe against the generated Database types and easy to
// audit.

export interface AdminAnswer {
  prompt: string;
  kind: string;
  valueText: string | null;
  valueNumeric: number | null;
}

export interface AdminResultRow {
  submissionId: string;
  formCode: string;
  formTitle: string;
  evaluatorName: string;
  evaluatorEmail: string;
  evaluateeName: string;
  submittedAt: string;
  status: string;
  totalSum: number | null;
  answers: AdminAnswer[];
}

export async function getAllResults(): Promise<AdminResultRow[]> {
  const db = createAdminClient();

  const [{ data: submissions }, { data: assignments }, { data: forms }, { data: profiles }, { data: roster }, { data: questions }, { data: answers }, { data: scores }] =
    await Promise.all([
      db.from("submissions").select("id, assignment_id, submitted_at, status"),
      db.from("form_assignments").select("id, form_id, evaluator_id, evaluatee_id"),
      db.from("forms").select("id, code, title"),
      db.from("profiles").select("id, roster_id"),
      db.from("roster").select("id, full_name, email"),
      db.from("form_questions").select("id, prompt, kind"),
      db.from("answers").select("submission_id, question_id, value_text, value_numeric"),
      db.from("submission_scores").select("submission_id, total_sum"),
    ]);

  const formById = new Map((forms ?? []).map((f) => [f.id, f]));
  const rosterById = new Map((roster ?? []).map((r) => [r.id, r]));
  const profileRoster = new Map(
    (profiles ?? []).map((p) => [p.id, rosterById.get(p.roster_id) ?? null]),
  );
  const assignmentById = new Map((assignments ?? []).map((a) => [a.id, a]));
  const questionById = new Map((questions ?? []).map((q) => [q.id, q]));
  const scoreBySubmission = new Map(
    (scores ?? []).map((s) => [s.submission_id, s.total_sum]),
  );
  const answersBySubmission = new Map<string, AdminAnswer[]>();
  for (const a of answers ?? []) {
    const q = questionById.get(a.question_id);
    const list = answersBySubmission.get(a.submission_id) ?? [];
    list.push({
      prompt: q?.prompt ?? "",
      kind: q?.kind ?? "",
      valueText: a.value_text,
      valueNumeric: a.value_numeric,
    });
    answersBySubmission.set(a.submission_id, list);
  }

  return (submissions ?? [])
    .map((s): AdminResultRow => {
      const assignment = assignmentById.get(s.assignment_id);
      const form = assignment ? formById.get(assignment.form_id) : undefined;
      const evaluator = assignment
        ? profileRoster.get(assignment.evaluator_id)
        : null;
      const evaluatee = assignment
        ? profileRoster.get(assignment.evaluatee_id)
        : null;

      return {
        submissionId: s.id,
        formCode: form?.code ?? "",
        formTitle: form?.title ?? "",
        evaluatorName: evaluator?.full_name ?? "(unknown)",
        evaluatorEmail: evaluator?.email ?? "",
        evaluateeName: evaluatee?.full_name ?? "(unknown)",
        submittedAt: s.submitted_at,
        status: s.status,
        totalSum: scoreBySubmission.get(s.id) ?? null,
        answers: answersBySubmission.get(s.id) ?? [],
      };
    })
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}
