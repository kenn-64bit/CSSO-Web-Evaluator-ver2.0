import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getMySelfForm } from "@/lib/queries/selfEvaluations";
import { SelfFormShell } from "@/components/forms/SelfFormShell";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Self-evaluation · Evaluator" };

export default async function SelfFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  await requireUser();
  const { formId } = await params;

  // my_self_evaluations_view returns the one self form matching the caller's
  // role for the active cycle; a mismatch means it is not theirs / not open.
  const form = await getMySelfForm();
  if (!form || form.formId !== formId) notFound();

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
            You already submitted your self-evaluation. It can&rsquo;t be changed.
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

  return <SelfFormShell form={form} />;
}
