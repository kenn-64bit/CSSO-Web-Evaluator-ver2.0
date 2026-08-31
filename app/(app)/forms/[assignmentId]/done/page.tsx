import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { homeForRole } from "@/lib/auth/roles";
import { Card } from "@/components/ui/Card";

export default async function FormDonePage() {
  const user = await requireUser();

  return (
    <Card title="Evaluation submitted">
      <p className="text-sm text-neutral-600">
        Your response has been recorded. The person you evaluated will only ever
        see it under a per-cycle alias, never your name.
      </p>
      <div className="mt-4 flex gap-4 text-sm font-medium">
        <Link href="/forms" className="text-brand hover:underline">
          Back to My Forms
        </Link>
        <Link href={homeForRole(user.role)} className="text-brand hover:underline">
          Go to dashboard
        </Link>
      </div>
    </Card>
  );
}
