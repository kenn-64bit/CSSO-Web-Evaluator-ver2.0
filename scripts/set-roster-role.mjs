// Set (or create) a roster row's role in the configured Supabase project.
//
// Roster is the source of truth for role (supabase/migrations/0002_identity.sql).
// The roster_sync_profile trigger propagates a role change to an existing profiles
// row; a first-time user gets the role from the auth callback on next sign-in.
//
// Usage:
//   node --env-file=.env.local scripts/set-roster-role.mjs <email> <role> [full_name]
//   npm run set-roster-role -- <email> <role> [full_name]
//
// <full_name> is only used when the roster row does not exist yet (column is NOT NULL).
// Existing rows keep their current full_name.

import { createClient } from "@supabase/supabase-js";

const APP_ROLES = ["encrypt", "officer", "executive", "president", "admin"];
const CVSU_DOMAIN = "@cvsu.edu.ph";

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

const [email, role, fullName] = process.argv.slice(2);

if (!email || !role) {
  fail(
    "usage: node --env-file=.env.local scripts/set-roster-role.mjs <email> <role> [full_name]",
  );
}
if (!email.toLowerCase().endsWith(CVSU_DOMAIN)) {
  fail(`email must end with ${CVSU_DOMAIN} (got "${email}")`);
}
if (!APP_ROLES.includes(role)) {
  fail(`role must be one of ${APP_ROLES.join(" | ")} (got "${role}")`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  fail(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set — run with `node --env-file=.env.local ...`",
  );
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing, error: selectError } = await db
  .from("roster")
  .select("id, email, full_name, role, is_active")
  .ilike("email", email)
  .maybeSingle();
if (selectError) fail(`lookup failed: ${selectError.message}`);

let resultId;
if (existing) {
  console.log(
    `Found roster row for ${existing.email} (role=${existing.role}, is_active=${existing.is_active}). Updating role -> ${role}.`,
  );
  const { error } = await db
    .from("roster")
    .update({ role, is_active: true })
    .eq("id", existing.id);
  if (error) fail(`update failed: ${error.message}`);
  resultId = existing.id;
} else {
  if (!fullName) {
    fail(
      `no roster row for ${email} — pass a full_name as the 3rd argument to create one`,
    );
  }
  console.log(`No roster row for ${email}. Creating one with role=${role}.`);
  const { data, error } = await db
    .from("roster")
    .insert({ email, full_name: fullName, role, is_active: true })
    .select("id")
    .single();
  if (error) fail(`insert failed: ${error.message}`);
  resultId = data.id;
}

const { data: finalRow, error: finalError } = await db
  .from("roster")
  .select("id, email, full_name, role, is_active")
  .eq("id", resultId)
  .single();
if (finalError) fail(`re-read failed: ${finalError.message}`);

console.log("\nRoster row now:");
console.table([finalRow]);
console.log(
  "\nNote: if this user has already signed in, the roster_sync_profile trigger has\n" +
    "updated profiles.role. Otherwise the auth callback will set it on next sign-in.",
);
