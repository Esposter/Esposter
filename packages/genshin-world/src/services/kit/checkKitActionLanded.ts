import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStrike } from "#src/models/kit/KitStrike";

// Whether an action's first hit landed this step, either among the hits the step landed or among the strikes its summons queued
export const checkKitActionLanded = (
  action: KitAction,
  landedHits: readonly KitHit[],
  strikes: readonly KitStrike[],
): boolean => {
  const [firstHit] = action.hits;
  return firstHit !== undefined && (landedHits.includes(firstHit) || strikes.some(({ hit }) => hit === firstHit));
};
