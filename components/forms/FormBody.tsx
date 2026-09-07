import type { FormQuestion, ScaleOption } from "@/lib/queries/forms";
import { RatingMatrix } from "./RatingMatrix";
import { Card } from "@/components/ui/Card";

// Presentational core shared by the real fill-out screen (FormShell), the
// self-evaluation screen (SelfFormShell) and the admin preview. No <form>, no
// submit — just the header and the questions. Forms are rating-only
// (revision001.md): every question is rendered by RatingMatrix, there is no
// free-text input.
export function FormBody({
  title,
  evaluateeName,
  description,
  questions,
  scaleOptions,
  heading = "h1",
}: {
  title: string;
  evaluateeName: string;
  description: string | null;
  questions: FormQuestion[];
  scaleOptions: ScaleOption[];
  heading?: "h1" | "h2";
}) {
  const Heading = heading;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">
          Evaluation
        </p>
        <Heading className="text-2xl font-semibold tracking-tight text-neutral-900">
          {title}
        </Heading>
        <p className="text-sm text-neutral-600">
          You&rsquo;re evaluating{" "}
          <span className="font-medium text-neutral-900">{evaluateeName}</span>
        </p>
        {description ? (
          <p className="text-sm text-neutral-500">{description}</p>
        ) : null}
      </header>

      <Card className="space-y-6">
        {questions.length === 0 ? (
          <p className="text-sm text-neutral-600">This form has no questions.</p>
        ) : (
          <RatingMatrix questions={questions} options={scaleOptions} />
        )}
      </Card>
    </div>
  );
}
