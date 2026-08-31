import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env, getServiceRoleKey } from "@/lib/env";

// Service-role client — BYPASSES RLS. Spec §6:
//   * server components / route handlers / server actions only
//   * never in a 'use client' file, never NEXT_PUBLIC_
//   * needing it for a *read* means an RLS policy is missing
// The `server-only` import above turns a client-side import into a build error.
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() called in the browser.");
  }

  return createSupabaseClient<Database>(env.supabaseUrl, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
