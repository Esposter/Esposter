import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";

import { checkLandsKitHit } from "#src/services/kit/checkLandsKitHit";

// The hits from the next to land on, in the order their hitmarks fall, whose hitmarks fall no later than the seconds
// Now reached, pushed into the landed hits unless a hit's landing condition does not hold in the context it lands in. It
// Returns the index of the next hit still to land
export const landKitHits = (
  hits: readonly KitHit[],
  nextHitIndex: number,
  toSeconds: number,
  landedHits: KitHit[],
  context: KitContext,
): number => {
  let index = nextHitIndex;
  for (let hit = hits[index]; hit && hit.hitmarkSeconds <= toSeconds; hit = hits[++index])
    if (checkLandsKitHit(hit, context)) landedHits.push(hit);
  return index;
};
