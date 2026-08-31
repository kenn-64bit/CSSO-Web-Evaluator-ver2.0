import { requireRole } from "@/lib/auth/session";
import { getAllFormsWithScoring } from "@/lib/queries/adminForms";
import { Table, Th, Td } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Forms · Evaluator" };

const badge = "rounded bg-brand-muted px-2 py-0.5 text-xs text-brand";

export default async function AdminFormsPage() {
  await requireRole("admin");
  const { forms, scales } = await getAllFormsWithScoring();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Forms</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Read-only. Form definitions, questions, and scoring weights are edited
          in Supabase Studio — this view never writes. {forms.length} forms.
        </p>
      </div>

      {forms.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-600">No forms defined.</p>
        </Card>
      ) : (
        <ul className="space-y-4">
          {forms.map((form) => (
            <li key={form.id}>
              <Card>
                <div className="font-medium text-neutral-900">{form.title}</div>
                <div className="text-xs text-neutral-500">{form.code}</div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={badge}>
                    {form.evaluatorRole} → {form.evaluateeRole}
                  </span>
                  <span className={badge}>
                    {form.isActive ? "active" : "inactive"}
                  </span>
                  {form.resultsVisibleToEvaluatee ? (
                    <span className={badge}>results visible to evaluatee</span>
                  ) : null}
                </div>

                {form.description ? (
                  <p className="mt-2 text-sm text-neutral-600">
                    {form.description}
                  </p>
                ) : null}

                <div className="mt-4">
                  <div className="mb-2 text-sm font-semibold text-neutral-700">
                    Questions
                  </div>
                  {form.questions.length === 0 ? (
                    <p className="text-sm text-neutral-600">No questions.</p>
                  ) : (
                    <Table
                      head={
                        <>
                          <Th>#</Th>
                          <Th>Prompt</Th>
                          <Th>Kind</Th>
                          <Th>Required</Th>
                        </>
                      }
                    >
                      {form.questions.map((q) => (
                        <tr key={q.id}>
                          <Td>{q.orderIndex}</Td>
                          <Td>{q.prompt}</Td>
                          <Td>{q.kind}</Td>
                          <Td>{q.isRequired ? "Yes" : "No"}</Td>
                        </tr>
                      ))}
                    </Table>
                  )}
                </div>

                <div className="mt-4">
                  <div className="mb-2 text-sm font-semibold text-neutral-700">
                    Weights
                    {form.ratingScaleKey ? ` — ${form.ratingScaleKey}` : ""}
                  </div>
                  {!form.ratingScaleKey ? (
                    <p className="text-sm text-neutral-600">
                      No weighted scoring.
                    </p>
                  ) : form.scaleOptions.length === 0 ? (
                    <p className="text-sm text-neutral-600">
                      Scale has no options.
                    </p>
                  ) : (
                    <Table
                      head={
                        <>
                          <Th>Option</Th>
                          <Th>Weight %</Th>
                          <Th>Order</Th>
                        </>
                      }
                    >
                      {form.scaleOptions.map((o) => (
                        <tr key={o.optionKey}>
                          <Td>{o.optionKey}</Td>
                          <Td>{o.weightPercent}</Td>
                          <Td>{o.displayOrder}</Td>
                        </tr>
                      ))}
                    </Table>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Rating scales</h2>
        {scales.length === 0 ? (
          <Card>
            <p className="text-sm text-neutral-600">No rating scales defined.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {scales.map((scale) => (
              <li key={scale.key}>
                <Card>
                  <div className="font-medium text-neutral-900">{scale.label}</div>
                  <div className="text-xs text-neutral-500">{scale.key}</div>

                  <div className="mt-3">
                    {scale.options.length === 0 ? (
                      <p className="text-sm text-neutral-600">No options.</p>
                    ) : (
                      <Table
                        head={
                          <>
                            <Th>Option</Th>
                            <Th>Weight %</Th>
                            <Th>Order</Th>
                          </>
                        }
                      >
                        {scale.options.map((o) => (
                          <tr key={o.optionKey}>
                            <Td>{o.optionKey}</Td>
                            <Td>{o.weightPercent}</Td>
                            <Td>{o.displayOrder}</Td>
                          </tr>
                        ))}
                      </Table>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-neutral-500">
                    Used by: {scale.usedByFormCodes.join(", ") || "—"}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
