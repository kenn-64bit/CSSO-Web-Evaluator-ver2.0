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
      <div className="mx-auto max-w-2xl">
        <Card>
          <span className="inline-flex items-center rounded-full bg-brand-muted px-2.5 py-0.5 text-xs font-medium text-brand-dark">
            Submitted
          </span>
          <h1 className="mt-3 text-lg font-semibold text-neutral-900">
            {form.formTitle}
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            You already submitted this evaluation. It can&rsquo;t be changed.
          </p>
          <Link
            href="/forms"
            className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
          >
            Back to My Forms
          </Link>
        </Card>
      </div>
    );
  }

  return <FormShell form={form} />;
}
