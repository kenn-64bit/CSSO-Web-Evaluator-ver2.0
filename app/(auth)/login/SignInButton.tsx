"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { env } from "@/lib/env";

// Spec §4: single Google OAuth button. `hd: "*"` is only a non-scoping UX hint
// (optimize for G Suite accounts without pinning one domain) so that
// `prompt: "select_account"` always shows the account chooser. The real domain
// check happens server-side in the callback and again in the database.
export function SignInButton() {
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${env.siteUrl}/auth/callback`,
        queryParams: { hd: "*", prompt: "select_account" },
      },
    });
    if (error) setPending(false);
  }

  return (
    <Button onClick={signIn} disabled={pending} className="w-full">
      {pending ? "Redirecting…" : "Sign in with CvSU Google Account"}
    </Button>
  );
}
