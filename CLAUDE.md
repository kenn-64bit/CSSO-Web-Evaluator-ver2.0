# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Scaffolded. The Next.js App Router project, the full Supabase schema (migrations
`supabase/migrations/0001..0013`, `supabase/seed.sql`), the query layer, all routes from
spec §7, and the required alias-invariant test exist. [architecture (1).md](architecture%20(1).md)
remains authoritative: "When code and this file disagree, treat this file as the intended
design and flag the divergence."

### Commands

- `npm run dev` / `npm run build` / `npm run lint` — Next.js.
- `npm run typecheck` — `tsc --noEmit` (strict, no `any`).
- `npm test` — Vitest (all suites). Single file: `npx vitest run tests/alias-invariant.test.ts`.
  The alias-invariant suite auto-skips unless `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set.
- `supabase start` (needs Docker) → `supabase db reset` applies migrations + seed.
- `npm run db:types` — regenerate `types/database.ts` from the local stack. The committed
  `types/database.ts` is a **hand-written placeholder** (flagged in-file) until a local stack
  is available; replace it with generated output.

### Known divergences from spec to revisit

- `types/database.ts` is hand-authored, not generated (no Docker in the scaffold env).
- `current_role()` is named `current_app_role()` to avoid the reserved word.
- Extra definer-rights views not in the spec — `my_assignments_view` (evaluator worklist;
  needed because `profiles`/`roster` are non-admin-unreadable) and `officer_results_visible`
  (wraps `officer_results_view` with the O-3 ≥3 threshold).
- Open questions O-1..O-6 are built to their documented defaults; each is flagged with an
  `O-n` comment at the relevant code/SQL site.

## What this app is

**Evaluator** — an internal performance-evaluation web app for a Cavite State University unit. Signed-in members fill out evaluation forms about other members; results feed two dashboards with sharply different visibility.

Stack (locked — do not substitute or add overlapping libraries): Next.js App Router + React + TypeScript, Tailwind for all styling, Supabase (Postgres + Auth + Storage), Vercel hosting. Free-tier constraints: no always-on workers, no cron beyond Supabase scheduled functions; aggregation is an on-demand materialized view (`submission_scores`), not a worker.

## Architecture invariants (the parts that span many files)

- **The alias invariant is the core product guarantee.** An officer viewing feedback about themselves must never receive the evaluator's `evaluator_id`, email, or name — not in a column, join, error message, or grouped count. Enforced in three layers: column `revoke` on `form_assignments.evaluator_id`, a `security_barrier` view `officer_results_view` that substitutes `alias_code`, and a required test asserting the officer payload contains no `profiles.id` UUID other than their own. Aliases are regenerated per `evaluation_cycle` — never store a stable alias on `roster`.

- **Roles are a lookup, not a hierarchy.** Five-value Postgres enum (`employee`, `officer`, `executive`, `president`, `admin`). Never write `if (role >= X)`. Role comes from `roster`/`profiles`, never from the client, OAuth claims, or JWT.

- **RLS is the security boundary, not the UI.** RLS enabled on every table; no `using (true)` policies on submission data. Use a `stable security definer` `current_role()` helper inside policies. The Next.js UI and `middleware.ts` are redirect conveniences only; every route's server component must re-check.

- **Two independent domain checks** (`@cvsu.edu.ph`): one in the auth callback, one in the database (constraint/trigger), because Supabase Studio and direct API access bypass Next.js. Unmatched emails are never auto-provisioned.

- **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) bypasses RLS. Server components / route handlers / server actions only; never in a `'use client'` file, never `NEXT_PUBLIC_`. Needing it for a read means an RLS policy is missing.

- **Assignment table is the source of truth for who evaluates whom.** A form shows on "My Forms" only when a `form_assignments` row exists for the user in the active cycle with no attached `submissions` row — do not derive form lists from role alone.

- **Scoring weights are data, not constants.** `rating_scale_options.weight_percent`, resolved live at query time by joining `forms.rating_scale_key` → `option_key = answers.value_text`. Scores are not historically frozen (see open question O-6).

## Conventions

- TypeScript strict, no `any`. Database types are generated into [types/database.ts], not hand-written.
- Server Components by default; `'use client'` only for genuine interactivity. All mutations are Server Actions — no client-side Supabase writes.
- All DB reads go through `lib/queries/` (one file per domain area) so the RLS surface is auditable in one place. Components never build Supabase queries inline.
- `snake_case` in SQL, `camelCase` in TS; convert at the query-layer boundary.
- Schema changes are ordered migration files in `supabase/migrations/` only — never hand-edited in Studio. Studio is for roster and cycle data.
- User-facing errors are generic; never echo Postgres error text to the client.

## Non-goals (do not build unprompted)

Notifications, file uploads, a separate admin CMS, real-time subscriptions, any non-Google auth, self-service registration, mobile apps, multi-tenancy.

## Open questions

[architecture (1).md](architecture%20(1).md) §11 lists six unresolved product questions (O-1..O-6) each with a stated default to use when code must proceed. Consult it before designing officer-results visibility, executive/president feedback, minimum-submission thresholds, or weight snapshotting.

## Skills

`.agents/skills/` vendors `web-design-guidelines`, `frontend-design`, and `owasp-security` (see `skills-lock.json`).
