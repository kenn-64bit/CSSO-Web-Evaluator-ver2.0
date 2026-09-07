import type { AppRole } from "@/lib/auth/roles";

// revision001.md scoring helpers. The SQL side has a mirror: evaluation_band()
// (migration 0018). Keep the two in sync.

export type ResultSourceKey = "self" | "officer" | "encrypt";

// A raw option average (0..100 = avg of weight_percent) rescaled to the 0–4
// band scale. avg N_O/1/2/3/4 -> 0/10/30/60/100 -> /25 -> 0/0.4/1.2/2.4/4.
export function normalizeWeightAverage(avgWeightPercent: number): number {
  return avgWeightPercent / 25;
}

interface Band {
  min: number; // lower-inclusive
  name: string;
}

// Ordered high -> low. Boundaries are lower-inclusive and cascading; the doc's
// overlapping endpoints (3.5, 3.0, …) resolve upward.
export const EVALUATION_BANDS: readonly Band[] = [
  { min: 3.5, name: "Exceeding Expectations" },
  { min: 3.0, name: "Fully Meeting Expectations" },
  { min: 2.5, name: "Mostly Meeting Expectations" },
  { min: 2.0, name: "Partially Meeting Expectations" },
  { min: 1.0, name: "Not Meeting Expectations" },
  { min: 0.5, name: "Failing to Meet Expectations" },
  { min: 0, name: "Unacceptable" },
];

export function evaluationBand(score: number | null): string | null {
  if (score === null || Number.isNaN(score)) return null;
  return EVALUATION_BANDS.find((b) => score >= b.min)?.name ?? "Unacceptable";
}

export type CategoryScores = Partial<Record<ResultSourceKey, number | null>>;
export type WeightTable = Record<AppRole, Partial<Record<ResultSourceKey, number>>>;

// Weighted blend of the available category averages (all already 0–4). Missing
// categories are skipped and the remaining weights are renormalized so the
// result stays on the 0–4 scale. Returns null when nothing is available.
export function blendFinalScore(
  role: AppRole,
  scores: CategoryScores,
  weights: WeightTable,
): number | null {
  const roleWeights = weights[role] ?? {};
  let weighted = 0;
  let totalWeight = 0;
  for (const key of ["self", "officer", "encrypt"] as const) {
    const value = scores[key];
    const weight = roleWeights[key];
    if (value === null || value === undefined || weight === undefined) continue;
    weighted += value * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return null;
  return weighted / totalWeight;
}
