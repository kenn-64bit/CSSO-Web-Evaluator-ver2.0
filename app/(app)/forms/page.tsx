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
      <Card title="My Forms">
        <p className="text-sm text-neutral-600">
          There is no active evaluation cycle right now.
        </p>
      </Card>
    );
  }

  const pending = await getMyPendingForms(cycle.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">My Forms</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {cycle.name} — {pending.length}{" "}
          {pending.length === 1 ? "evaluation" : "evaluations"} pending.
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-600">
            You have nothing left to fill out for this cycle. Thank you.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {pending.map((a) => (
            <li key={a.assignmentId}>
              <Link href={`/forms/${a.assignmentId}`} className="block">
                <Card className="transition-colors hover:border-brand">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">
                        {a.formTitle}
                      </div>
                      <p className="mt-0.5 text-sm text-neutral-600">
                        Evaluating: {a.evaluateeName}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-brand">Open →</span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
