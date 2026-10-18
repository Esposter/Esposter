import type { KitEffect } from "#src/models/kit/KitEffect";

import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// The stacks a character's status of an id holds while it has not run out, and none once it has, so a stack count that
// Lapsed with its status starts again from nothing
export const countKitStatusStacks = (effects: readonly KitEffect[], characterId: number, id: string): number => {
  const status = findKitStatus(effects, characterId, id);
  return status && status.secondsRemaining > 0 ? (status.stacks ?? 0) : 0;
};
