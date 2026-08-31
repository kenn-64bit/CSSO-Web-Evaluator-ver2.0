"use client";

import { useActionState } from "react";
import type { FormDetail } from "@/lib/queries/forms";
import { submitForm, type SubmitState } from "@/app/(app)/forms/[assignmentId]/actions";
import { QuestionRenderer } from "./QuestionRenderer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const initialState: SubmitState = { error: null };

export function FormShell({ form }: { form: FormDetail }) {
  const [state, formAction, pending] = useActionState(submitForm, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">
          {form.formTitle}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Evaluating: <span className="font-medium">{form.evaluateeName}</span>
        </p>
        {form.formDescription ? (
          <p className="mt-1 text-sm text-neutral-500">{form.formDescription}</p>
        ) : null}
      </div>

      <input type="hidden" name="assignmentId" value={form.assignmentId} />

      <Card>
        {form.questions.map((q) => (
          <QuestionRenderer
            key={q.id}
            question={q}
            scaleOptions={form.scaleOptions}
          />
        ))}
      </Card>

      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting…" : "Submit evaluation"}
        </Button>
        <span className="text-xs text-neutral-500">
          Once submitted, a form cannot be changed.
        </span>
      </div>
    </form>
  );
}
