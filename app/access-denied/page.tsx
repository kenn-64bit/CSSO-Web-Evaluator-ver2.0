import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Access denied · Evaluator" };

export default function AccessDeniedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Card title="Access denied">
        <p className="text-sm text-neutral-600">
          Your account is not on the unit roster, or it has been deactivated. If
          you believe this is a mistake, contact the evaluation administrator.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
        >
          Back to sign in
        </Link>
      </Card>
    </main>
  );
}
