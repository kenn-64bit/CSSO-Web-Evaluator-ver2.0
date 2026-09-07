import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getActiveCycle } from "@/lib/queries/cycles";
import { getMyPendingForms } from "@/lib/queries/forms";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "My Forms · Evaluator" };

export default async function MyFormsPage() {
  await requireUser();

  const cycle = await getActiveCycle();
  if (!cycle) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card title="My Forms">
          <p className="text-sm text-neutral-600">
            There is no active evaluation cycle right now. Check back once one
            opens.
          </p>
        </Card>
      </div>
    );
  }

  const pending = await getMyPendingForms(cycle.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">
          {cycle.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          My Forms
        </h1>
        <p className="text-sm text-neutral-600">
          {pending.length === 0
            ? "Nothing pending."
            : `${pending.length} ${
                pending.length === 1 ? "evaluation" : "evaluations"
              } to complete.`}
        </p>
      </header>

      {pending.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-600">
            You&rsquo;re all caught up for this cycle. Thanks for getting it
            done.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {pending.map((a) => (
            <li key={a.assignmentId}>
              <Link
                href={`/forms/${a.assignmentId}`}
                className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <Card className="flex items-center justify-between gap-4 transition-colors motion-reduce:transition-none hover:border-brand">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">
                      Evaluation
                    </p>
                    <div className="mt-0.5 text-sm font-semibold text-neutral-900">
                      {a.formTitle}
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-600">
                      Evaluating {a.evaluateeName}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-brand">
                    Start →
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
