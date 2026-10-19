import type { NamedHitCall } from "#src/models/genshinAssets/kits/NamedHitCall";

// The order of two queue calls by their damage delay, a call with no delay last
export const compareQueuedDelays = (left: Pick<NamedHitCall, "delay">, right: Pick<NamedHitCall, "delay">): number =>
  (left.delay ?? Number.MAX_SAFE_INTEGER) - (right.delay ?? Number.MAX_SAFE_INTEGER);
