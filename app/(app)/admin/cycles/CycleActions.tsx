"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import {
  regenerateAliases,
  refreshScores,
  setCycleActive,
} from "./actions";

export function CycleActions({
  cycleId,
  isActive,
}: {
  cycleId: string;
  isActive: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => start(() => setCycleActive(cycleId, !isActive))}
      >
        {isActive ? "Close cycle" : "Open cycle"}
      </Button>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => start(() => regenerateAliases(cycleId))}
      >
        Regenerate aliases
      </Button>
      <Button
        variant="secondary"
        disabled={pending}
        onClick={() => start(() => refreshScores())}
      >
        Refresh scores
      </Button>
    </div>
  );
}
