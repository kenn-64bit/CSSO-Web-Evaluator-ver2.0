"use client";

import { useActionState } from "react";
import type { SelfFormDetail } from "@/lib/queries/selfEvaluations";
import {
  submitSelfForm,
  type SubmitState,
} from "@/app/(app)/self/[formId]/actions";
import { FormBody } from "./FormBody";
import { Button } from "@/components/ui/Button";

const initialState: SubmitState = { error: null };

export function SelfFormShell({ form }: { form: SelfFormDetail }) {
  const [state, formAction, pending] = useActionState(submitSelfForm, initialState);

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      <input type="hidden" name="formId" value={form.formId} />

      <FormBody
        title={form.formTitle}
        evaluateeName={form.evaluateeName}
        description={form.formDescription}
        questions={form.questions}
        scaleOptions={form.scaleOptions}
      />

      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Submitting…" : "Submit self-evaluation"}
        </Button>
        <span className="text-xs text-neutral-500">
          You can&rsquo;t change a form after submitting.
        </span>
      </div>
    </form>
  );
}
