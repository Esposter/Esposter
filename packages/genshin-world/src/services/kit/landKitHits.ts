import type { KitHit } from "#src/models/kit/KitHit";

// The hits from the next to land on, in the order their hitmarks fall, whose hitmarks fall no later than the seconds
// Now reached, pushed into the landed hits. It returns the index of the next hit still to land
export const landKitHits = (
  hits: readonly KitHit[],
  nextHitIndex: number,
  toSeconds: number,
  landedHits: KitHit[],
): number => {
  let index = nextHitIndex;
  for (let hit = hits[index]; hit && hit.hitmarkSeconds <= toSeconds; hit = hits[++index]) landedHits.push(hit);
  return index;
};
