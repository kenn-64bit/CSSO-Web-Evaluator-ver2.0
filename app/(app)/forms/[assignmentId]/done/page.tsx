import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { homeForRole } from "@/lib/auth/roles";
import { Card } from "@/components/ui/Card";

export default async function FormDonePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-muted text-brand-dark"
            aria-hidden="true"
          >
            ✓
          </span>
          <h1 className="text-lg font-semibold text-neutral-900">
            Evaluation submitted
          </h1>
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          Your response has been recorded. The person you evaluated will only
          ever see it under a per-cycle alias, never your name.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
          <Link href="/forms" className="text-brand hover:underline">
            Back to My Forms
          </Link>
          <Link
            href={homeForRole(user.role)}
            className="text-brand hover:underline"
          >
            Go to dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
