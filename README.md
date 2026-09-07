# Evaluator

Internal performance-evaluation web app for a Cavite State University unit (CSSO).
Signed-in members fill out evaluation forms about other members; results feed two
dashboards with sharply different visibility:

- **Admin** sees every submission with real identities.
- **Officers / executives / president** see only evaluations directed at them,
  with the evaluator's identity replaced by a per-cycle alias (`OFFICER01`,
  `ENC0042`, …).

Anonymity of the evaluator toward the person being evaluated is the core product
guarantee. Most of the design exists to make that guarantee hard to break by
accident — see [`architecture (1).md`](architecture%20(1).md), which is the
authoritative spec, and [`CLAUDE.md`](CLAUDE.md) for working conventions.

## Stack

Locked — do not substitute or add overlapping libraries.

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) · React 19 · TypeScript (strict, no `any`) |
| Styling | Tailwind CSS (all styling) |
| Auth | Supabase Auth — Google OAuth, restricted to `@cvsu.edu.ph` |
| Database | Supabase Postgres, Row Level Security as the security boundary |
| Hosting | Vercel (app) · Supabase (Postgres + Auth + Storage) |
| Admin management | Supabase Studio (non-devs edit roster + cycle data directly) |

Free-tier constraints: no always-on workers, no cron beyond Supabase scheduled
functions. Score aggregation is an on-demand view, not a background job.

## Getting started

Prerequisites: Node 20+ and Docker (for the local Supabase stack).

```bash
npm install
cp .env.local.example .env.local     # then fill in the values

supabase start                       # boots local Postgres + Auth (needs Docker)
supabase db reset                    # applies supabase/migrations/* + supabase/seed.sql
npm run db:types                     # regenerate types/database.ts from the local stack

npm run dev                          # http://localhost:3000
```

### Environment variables

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Bypasses RLS. Never prefix `NEXT_PUBLIC_`, never import in a `'use client'` file. |
| `NEXT_PUBLIC_SITE_URL` | public | Base URL used to build the OAuth redirect (`/auth/callback`). |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm test` | Vitest, all suites. Single file: `npx vitest run tests/alias-invariant.test.ts` |
| `npm run db:reset` | `supabase db reset` — reapply migrations + seed |
| `npm run db:types` | Regenerate `types/database.ts` from the local stack |
| `npm run set-roster-role -- <email> <role> [full_name]` | Create/update a roster row's role |

The `alias-invariant` test suite auto-skips unless `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set.

## Roles

Five-value Postgres enum, **non-hierarchical** — it is a lookup, never a ranking.
Never write `if (role >= X)`. Role always comes from `roster` / `profiles`, never
from the client or JWT claims.

```
encrypt · officer · executive · president · admin
```

Each role has a home route (`/encrypt`, `/officer`, …); `admin` may access
everything.

## Project layout

```
app/
  (auth)/login/            Google sign-in
  auth/callback/           OAuth callback — domain re-check + roster match + profile upsert
  (app)/                   authenticated area
    encrypt/ officer/ executive/ president/   role home pages
    forms/[assignmentId]/  fill out an assigned evaluation
    officer/results/       alias-masked feedback for the signed-in officer
    admin/                 roster, cycles, full results
lib/
  auth/                    session + role helpers
  queries/                 all DB reads, one file per domain (auditable RLS surface)
  supabase/                server / client / admin (service-role) clients
middleware.ts              redirect convenience only — NOT a security boundary
supabase/
  migrations/0001..0013    ordered schema migrations (never hand-edit in Studio)
  seed.sql                 rating scales, forms, sample data
tests/alias-invariant...   required test: officer payload leaks no other identity
```

## Security model

- **RLS is the boundary.** Enabled on every table; every route's server component
  re-checks auth and role. The UI and `middleware.ts` are redirect conveniences.
- **The alias invariant** is enforced in three layers: a column `revoke` on
  `form_assignments.evaluator_id`, a `security_barrier` view that substitutes
  `alias_code`, and the required test asserting an officer's payload contains no
  other person's `profiles.id`. Aliases are regenerated per cycle.
- **Two independent `@cvsu.edu.ph` checks:** one in the auth callback, one as a
  Postgres constraint (Studio and direct API access bypass Next.js). Unmatched
  emails are never auto-provisioned.
- **Service-role key** is used only in server code, for the one bootstrap roster
  lookup before a profile exists. Needing it elsewhere means an RLS policy is
  missing.

## Deployment

1. Set all four environment variables in the Vercel project (Production + Preview).
2. Push migrations to the hosted Supabase project (`supabase db push`) **and**
   apply `supabase/seed.sql` — `db push` does not run the seed.
3. In Supabase Auth: enable Google, set the Site URL, and allow-list
   `https://<prod-domain>/auth/callback`.
4. Deploy the branch to Vercel.
