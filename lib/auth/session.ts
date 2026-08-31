import { redirect } from "next/navigation";
import type { AppRole } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { homeForRole } from "@/lib/auth/roles";

export interface CurrentUser {
  id: string;
  email: string;
  role: AppRole;
  rosterId: string;
}

// Loads the signed-in user's profile. Every protected route's Server Component
// calls this — middleware is only a redirect convenience (spec §7).
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, role, roster_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role,
    rosterId: profile.roster_id,
  };
}

// Redirects to /login when signed out.
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Redirects to the caller's own role home when their role is not allowed here.
// Admin is allowed everywhere (spec §3: full access).
export async function requireRole(
  allowed: AppRole | readonly AppRole[],
): Promise<CurrentUser> {
  const user = await requireUser();
  const allowList = Array.isArray(allowed) ? allowed : [allowed];
  if (user.role === "admin" || allowList.includes(user.role)) return user;
  redirect(homeForRole(user.role));
}
