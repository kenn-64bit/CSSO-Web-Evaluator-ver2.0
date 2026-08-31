import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getFormForAssignment } from "@/lib/queries/forms";
import { FormShell } from "@/components/forms/FormShell";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  await requireUser();
  const { assignmentId } = await params;

  // my_assignments_view is self-scoped to the evaluator; a missing row means the
  // assignment is not this user's (or does not exist).
  const form = await getFormForAssignment(assignmentId);
  if (!form) notFound();

  if (form.alreadySubmitted) {
    return (
      <Card title={form.formTitle}>
        <p className="text-sm text-neutral-600">
          You already submitted this evaluation. It cannot be changed.
        </p>
        <Link
          href="/forms"
          className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
        >
          Back to My Forms
        </Link>
      </Card>
    );
  }

  return <FormShell form={form} />;
}
