import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

// The hits of an action whose hitmark falls after the seconds it was at and no later than the seconds it is now at,
// Pushed into the step's landed hits
export const landKitHits = (
  { hits }: KitAction,
  fromSeconds: number,
  toSeconds: number,
  landedHits: KitHit[],
): void => {
  for (const hit of hits) if (hit.hitmarkSeconds > fromSeconds && hit.hitmarkSeconds <= toSeconds) landedHits.push(hit);
};
