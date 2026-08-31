import { Card } from "@/components/ui/Card";
import { SignInButton } from "./SignInButton";

export const metadata = { title: "Sign in · Evaluator" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Card>
        <h1 className="text-lg font-semibold text-neutral-900">Evaluator</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Internal performance evaluation. Sign in with your{" "}
          <span className="font-medium">@cvsu.edu.ph</span> Google account.
        </p>
        <div className="mt-5">
          <SignInButton />
        </div>
      </Card>
      <p className="mt-4 text-center text-xs text-neutral-500">
        Access is limited to members on the unit roster.
      </p>
    </main>
  );
}
