import type { FormQuestion, ScaleOption } from "@/lib/queries/forms";
import { RatingMatrix } from "./RatingMatrix";
import { QuestionRenderer } from "./QuestionRenderer";
import { Card } from "@/components/ui/Card";

const isRating = (q: FormQuestion) =>
  q.kind === "likert" || q.kind === "scale";

// Presentational core shared by the real fill-out screen (FormShell) and the
// admin preview. No <form>, no submit — just the header and the questions.
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
  const ratingQuestions = questions.filter(isRating);
  const firstRatingId = ratingQuestions[0]?.id;
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
          questions.map((q) => {
            if (isRating(q)) {
              return q.id === firstRatingId ? (
                <RatingMatrix
                  key="rating-matrix"
                  questions={ratingQuestions}
                  options={scaleOptions}
                />
              ) : null;
            }
            return <QuestionRenderer key={q.id} question={q} />;
          })
        )}
      </Card>
    </div>
  );
}
