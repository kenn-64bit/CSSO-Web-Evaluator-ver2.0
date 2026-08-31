import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

// Spec §6, layer 3 — the REQUIRED test.
//
// Asserts that an officer's results payload contains no UUID matching any
// profiles.id other than their own, and no evaluator email/name string. Also
// checks the O-3 threshold (results hidden below 3 submissions).
//
// Requires a running Supabase (local: `supabase start`). Skipped when the env
// is not configured so `npm test` still passes without Docker.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Opt-in: this suite needs a running Supabase (local `supabase start`). Run it
// with `RUN_INTEGRATION=1 npm test`. The placeholder keys in .env.local do not
// count.
const configured =
  process.env.RUN_INTEGRATION === "1" &&
  Boolean(URL && SERVICE && ANON) &&
  !SERVICE!.startsWith("placeholder");

const tag = randomUUID().slice(0, 8);
const email = (name: string) => `${name}.${tag}@cvsu.edu.ph`;

interface Person {
  authId: string;
  rosterId: string;
  fullName: string;
  email: string;
  password: string;
}

describe.skipIf(!configured)("alias invariant", () => {
  let admin: SupabaseClient;
  const evaluators: Person[] = [];
  let officer: Person;
  let cycleId: string;
  let officerFormId: string;

  async function makePerson(
    name: string,
    role: string,
  ): Promise<Person> {
    const fullName = `${name} ${tag}`;
    const addr = email(name);
    const password = `pw-${randomUUID()}`;
    const { data: created, error } = await admin.auth.admin.createUser({
      email: addr,
      password,
      email_confirm: true,
    });
    if (error || !created.user) throw error ?? new Error("no user");

    const { data: roster, error: rErr } = await admin
      .from("roster")
      .insert({ email: addr, full_name: fullName, role, is_active: true })
      .select("id")
      .single();
    if (rErr || !roster) throw rErr ?? new Error("no roster");

    await admin.from("profiles").insert({
      id: created.user.id,
      roster_id: roster.id,
      email: addr,
      role,
    });

    return {
      authId: created.user.id,
      rosterId: roster.id,
      fullName,
      email: addr,
      password,
    };
  }

  beforeAll(async () => {
    admin = createClient(URL!, SERVICE!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    officer = await makePerson("evaluatee", "officer");
    for (const n of ["critic1", "critic2", "critic3"]) {
      evaluators.push(await makePerson(n, "officer"));
    }

    const { data: cycle } = await admin
      .from("evaluation_cycles")
      .insert({
        name: `test ${tag}`,
        opens_at: new Date(Date.now() - 86_400_000).toISOString(),
        closes_at: new Date(Date.now() + 86_400_000).toISOString(),
        is_active: false,
      })
      .select("id")
      .single();
    cycleId = cycle!.id;

    const { data: form } = await admin
      .from("forms")
      .select("id")
      .eq("code", "OFFICER_TO_OFFICER")
      .single();
    officerFormId = form!.id;

    // Aliases for every participant in this cycle.
    await admin.from("aliases").insert(
      [officer, ...evaluators].map((p, i) => ({
        cycle_id: cycleId,
        user_id: p.authId,
        alias_code: `OFF${String(i + 1).padStart(3, "0")}`,
      })),
    );

    // Each evaluator submits an evaluation ABOUT the officer.
    for (const evaluator of evaluators) {
      const { data: assignment } = await admin
        .from("form_assignments")
        .insert({
          cycle_id: cycleId,
          form_id: officerFormId,
          evaluator_id: evaluator.authId,
          evaluatee_id: officer.authId,
        })
        .select("id")
        .single();

      const { data: submission } = await admin
        .from("submissions")
        .insert({ assignment_id: assignment!.id, status: "submitted" })
        .select("id")
        .single();

      const { data: questions } = await admin
        .from("form_questions")
        .select("id, kind")
        .eq("form_id", officerFormId);

      await admin.from("answers").insert(
        (questions ?? []).map((q) => ({
          submission_id: submission!.id,
          question_id: q.id,
          value_text: q.kind === "text" ? "some comment" : "3",
        })),
      );
    }

    await admin.rpc("refresh_submission_scores");
  });

  afterAll(async () => {
    if (!configured) return;
    await admin.from("evaluation_cycles").delete().eq("id", cycleId);
    for (const p of [officer, ...evaluators]) {
      await admin.from("profiles").delete().eq("id", p.authId);
      await admin.from("roster").delete().eq("id", p.rosterId);
      await admin.auth.admin.deleteUser(p.authId);
    }
  });

  async function officerClient(): Promise<SupabaseClient> {
    const c = createClient(URL!, ANON!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await c.auth.signInWithPassword({
      email: officer.email,
      password: officer.password,
    });
    if (error) throw error;
    return c;
  }

  it("never leaks another person's identity to the officer", async () => {
    const c = await officerClient();
    const { data, error } = await c
      .from("officer_results_visible")
      .select("*");

    expect(error).toBeNull();
    expect(data).toHaveLength(3);

    const serialized = JSON.stringify(data);

    // No foreign profiles.id UUID.
    for (const evaluator of evaluators) {
      expect(serialized).not.toContain(evaluator.authId);
      expect(serialized).not.toContain(evaluator.rosterId);
      expect(serialized).not.toContain(evaluator.email);
      expect(serialized).not.toContain(evaluator.fullName);
    }
    // The officer's own id may appear (evaluatee_id); nothing else identity-like.
    expect(serialized).toContain(officer.authId);
  });

  it("cannot read evaluator_id or the aliases table directly", async () => {
    const c = await officerClient();

    const fa = await c.from("form_assignments").select("evaluator_id");
    expect(fa.error).not.toBeNull();

    const al = await c.from("aliases").select("*");
    expect(al.data ?? []).toHaveLength(0);
  });

  it("withholds results below the O-3 threshold of 3 submissions", async () => {
    // Remove one submission -> 2 remain -> the whole (form, cycle) drops out.
    const { data: assignments } = await admin
      .from("form_assignments")
      .select("id")
      .eq("cycle_id", cycleId)
      .limit(1);
    await admin
      .from("submissions")
      .delete()
      .eq("assignment_id", assignments![0].id);
    await admin.rpc("refresh_submission_scores");

    const c = await officerClient();
    const { data } = await c.from("officer_results_visible").select("*");
    expect(data ?? []).toHaveLength(0);
  });
});
