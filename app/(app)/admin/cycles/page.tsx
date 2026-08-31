import { requireRole } from "@/lib/auth/session";
import { listCycles } from "@/lib/queries/cycles";
import { Card } from "@/components/ui/Card";
import { CycleActions } from "./CycleActions";

export const metadata = { title: "Cycles · Evaluator" };

export default async function AdminCyclesPage() {
  await requireRole("admin");
  const cycles = await listCycles();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Cycles</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Only one cycle is active at a time. Regenerate aliases after opening a
          cycle; refresh scores after submissions close.
        </p>
      </div>

      {cycles.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-600">
            No cycles yet. Create one in Supabase Studio.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {cycles.map((c) => (
            <li key={c.id}>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">
                      {c.name}{" "}
                      {c.isActive ? (
                        <span className="ml-2 rounded bg-brand-muted px-2 py-0.5 text-xs text-brand">
                          active
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {new Date(c.opensAt).toLocaleDateString()} –{" "}
                      {new Date(c.closesAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <CycleActions cycleId={c.id} isActive={c.isActive} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
