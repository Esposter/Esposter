import type { ReputationExplore } from "#src/models/reputation/ReputationExplore";

// The exploration thresholds a nation's progress crosses going from its previous percentage to its current one, each
// Reached once: a threshold counts only when the progress passes it, so one already held pays nothing again
export const computeReputationExploresReached = (
  previousPercentage: number,
  percentage: number,
  explores: readonly ReputationExplore[],
): ReputationExplore[] =>
  explores.filter(({ exploreProgress }) => exploreProgress > previousPercentage && exploreProgress <= percentage);
