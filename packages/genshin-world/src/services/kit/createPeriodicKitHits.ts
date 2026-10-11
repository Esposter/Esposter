import type { KitHit } from "#src/models/kit/KitHit";
import type { Except } from "type-fest";

// A hit landing every interval from its first, as gcsim queues a tick each interval from the first: a copy of the hit for
// Each of its count, at the frame its first falls on plus that many intervals, counted from the start of what lands it
export const createPeriodicKitHits = (
  hit: Except<KitHit, "hitmarkSeconds">,
  count: number,
  firstFrames: number,
  intervalFrames: number,
): KitHit[] =>
  Array.from({ length: count }, (_value, index) => ({
    ...hit,
    hitmarkSeconds: (firstFrames + intervalFrames * index) / 60,
  }));
