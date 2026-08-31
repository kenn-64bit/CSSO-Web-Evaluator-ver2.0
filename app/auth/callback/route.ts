import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { homeForRole } from "@/lib/auth/roles";

const CVSU_DOMAIN = "@cvsu.edu.ph";

// Spec §4. Order matters:
//  1. exchange code for a session
//  2. re-verify the email domain server-side (the `hd` hint is NOT trusted)
//  3. match roster.email (citext) with is_active = true
//     - no match  -> discard session, redirect /access-denied (no auto-provision)
//  4. upsert the profiles row (role + roster_id come from roster, never the client)
//  5. redirect to the role's home route
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const denied = NextResponse.redirect(`${origin}/access-denied`);

  if (!code) return denied;

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return denied;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase().trim();
  if (!user || !email || !email.endsWith(CVSU_DOMAIN)) {
    await supabase.auth.signOut();
    return denied;
  }

  // roster is not readable under RLS by a user without a profile — use the
  // service-role client for this one bootstrap lookup.
  const admin = createAdminClient();
  const { data: rosterRow } = await admin
    .from("roster")
    .select("id, role, email, is_active")
    .ilike("email", email)
    .maybeSingle();

  if (!rosterRow || !rosterRow.is_active) {
    await supabase.auth.signOut();
    return denied;
  }

  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      roster_id: rosterRow.id,
      email: rosterRow.email,
      role: rosterRow.role,
    },
    { onConflict: "id" },
  );

  if (upsertError) {
    await supabase.auth.signOut();
    return denied;
  }

  return NextResponse.redirect(`${origin}${homeForRole(rosterRow.role)}`);
}
