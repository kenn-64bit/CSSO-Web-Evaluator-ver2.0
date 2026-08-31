import { requireRole } from "@/lib/auth/session";
import {
  getAllFormsWithScoring,
  type AdminFormRow,
  type RatingScaleSummary,
} from "@/lib/queries/adminForms";
import { Table, Th, Td } from "@/components/ui/Table";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Forms · Evaluator" };

const badge = "rounded bg-brand-muted px-2 py-0.5 text-xs text-brand";

function ScaleTable({ options }: { options: RatingScaleSummary["options"] }) {
  return (
    <Table
      head={
        <>
          <Th>Option</Th>
          <Th>Weight %</Th>
          <Th>Order</Th>
        </>
      }
    >
      {options.map((o) => (
        <tr key={o.optionKey}>
          <Td>{o.optionKey}</Td>
          <Td>{o.weightPercent}</Td>
          <Td>{o.displayOrder}</Td>
        </tr>
      ))}
    </Table>
  );
}

function FormCard({ form }: { form: AdminFormRow }) {
  return (
    <Card>
      <div className="font-medium text-neutral-900">{form.title}</div>
      <div className="text-xs text-neutral-500">{form.code}</div>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className={badge}>
          {form.evaluatorRole} → {form.evaluateeRole}
        </span>
        <span className={badge}>{form.isActive ? "active" : "inactive"}</span>
        {form.resultsVisibleToEvaluatee ? (
          <span className={badge}>results visible to evaluatee</span>
        ) : null}
      </div>

      {form.description ? (
        <p className="mt-2 text-sm text-neutral-600">{form.description}</p>
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
          Weights{form.ratingScaleKey ? ` — ${form.ratingScaleKey}` : ""}
        </div>
        {!form.ratingScaleKey ? (
          <p className="text-sm text-neutral-600">No weighted scoring.</p>
        ) : form.scaleOptions.length === 0 ? (
          <p className="text-sm text-neutral-600">Scale has no options.</p>
        ) : (
          <ScaleTable options={form.scaleOptions} />
        )}
      </div>
    </Card>
  );
}

function ScaleCard({ scale }: { scale: RatingScaleSummary }) {
  return (
    <Card>
      <div className="font-medium text-neutral-900">{scale.label}</div>
      <div className="text-xs text-neutral-500">{scale.key}</div>

      <div className="mt-3">
        {scale.options.length === 0 ? (
          <p className="text-sm text-neutral-600">No options.</p>
        ) : (
          <ScaleTable options={scale.options} />
        )}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Used by: {scale.usedByFormCodes.join(", ") || "—"}
      </p>
    </Card>
  );
}

export default async function AdminFormsPage() {
  await requireRole("admin");
  const { groups } = await getAllFormsWithScoring();
  const totalForms = groups.reduce((n, g) => n + g.forms.length, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Forms</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Read-only. Form definitions, questions, and scoring weights are edited
          in Supabase Studio — this view never writes. {totalForms} forms,
          grouped by the role that fills them out.
        </p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-600">No forms defined.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <details
              key={group.evaluatorRole}
              className="rounded-lg border border-neutral-200 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-neutral-900">
                <span className="capitalize">
                  {group.evaluatorRole}
                  <span className="ml-2 font-normal text-neutral-500">
                    · {group.forms.length}{" "}
                    {group.forms.length === 1 ? "form" : "forms"}
                  </span>
                </span>
                <span className="text-neutral-400 transition-transform [details[open]_&]:rotate-90">
                  ▸
                </span>
              </summary>

              <div className="space-y-6 border-t border-neutral-200 p-5">
                <ul className="space-y-4">
                  {group.forms.map((form) => (
                    <li key={form.id}>
                      <FormCard form={form} />
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-700">
                    Rating scales
                  </h3>
                  {group.scales.length === 0 ? (
                    <p className="text-sm text-neutral-600">
                      No rating scales used by these forms.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {group.scales.map((scale) => (
                        <li key={scale.key}>
                          <ScaleCard scale={scale} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
