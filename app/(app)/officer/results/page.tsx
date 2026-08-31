import { requireRole } from "@/lib/auth/session";
import { getMyOfficerResults } from "@/lib/queries/officerResults";
import { ResultsTable } from "@/components/results/ResultsTable";
import { ScoreSummary } from "@/components/results/ScoreSummary";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "My Results · Evaluator" };

export default async function OfficerResultsPage() {
  await requireRole("officer");

  // Reads officer_results_visible only — aliased, own feedback only, and hidden
  // entirely below the O-3 threshold of 3 submissions per form + cycle.
  const rows = await getMyOfficerResults();

  const scored = rows.filter((r) => r.totalSum !== null);
  const average =
    scored.length === 0
      ? null
      : scored.reduce((sum, r) => sum + (r.totalSum ?? 0), 0) / scored.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">My Results</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Feedback about you. Each evaluator appears only as a per-cycle alias.
          Results stay hidden until at least three evaluations exist for a form.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-600">
            No results are available yet.
          </p>
        </Card>
      ) : (
        <>
          <ScoreSummary count={rows.length} average={average} />
          <ResultsTable rows={rows} />
        </>
      )}
    </div>
  );
}
