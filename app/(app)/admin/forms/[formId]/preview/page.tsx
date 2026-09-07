import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getAllFormsWithScoring } from "@/lib/queries/adminForms";
import { FormBody } from "@/components/forms/FormBody";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Form preview · Evaluator" };

const SAMPLE_EVALUATEE = "(sample evaluatee)";

export default async function AdminFormPreviewPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  await requireRole("admin");
  const { formId } = await params;

  // Tiny dataset (spec §5, six forms) — reuse the grouped query rather than add a
  // by-id read, then flatten to find the one form.
  const { groups } = await getAllFormsWithScoring();
  const form = groups.flatMap((g) => g.forms).find((f) => f.id === formId);
  if (!form) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/admin/forms"
          className="text-sm font-medium text-brand hover:underline"
        >
          ← Forms
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-neutral-900">
          Form preview
        </h1>
        <div className="mt-1 text-sm text-neutral-600">
          <span className="font-medium">{form.title}</span>
          <span className="ml-2 font-mono text-xs text-neutral-500">
            {form.code}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Demo of the evaluator experience. Inputs are interactive; nothing here
          is saved.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-700">When assigned</h2>
        <p className="text-sm text-neutral-600">
          How this form appears in the evaluator&rsquo;s <em>My Forms</em> list.
        </p>
        <Card className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">
              Evaluation
            </p>
            <div className="mt-0.5 text-sm font-semibold text-neutral-900">
              {form.title}
            </div>
            <p className="mt-0.5 text-sm text-neutral-600">
              Evaluating {SAMPLE_EVALUATEE}
            </p>
          </div>
          <span className="shrink-0 text-sm font-medium text-brand">
            Start →
          </span>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-700">When answering</h2>
        <p className="text-sm text-neutral-600">
          The screen the evaluator fills out. Not submittable here.
        </p>

        <FormBody
          heading="h2"
          title={form.title}
          evaluateeName={SAMPLE_EVALUATEE}
          description={form.description}
          questions={form.questions}
          scaleOptions={form.scaleOptions}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="lg" disabled>
            Submit evaluation
          </Button>
          <span className="text-xs text-neutral-500">
            Preview only — this form cannot be submitted here.
          </span>
        </div>
      </section>
    </div>
  );
}
