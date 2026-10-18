import type { KitEffect } from "#src/models/kit/KitEffect";

import { KIT_SWAP_LOCK_ID } from "#src/services/kit/constants";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Whether a swap lock holds on a character, so the party may not swap off them while it lasts
// A lock its stance ended reads as none, as the step that drops it runs after
// An empty field slot holds none, as no one stands on it
export const checkIsKitSwapBlocked = (effects: readonly KitEffect[], characterId: number | undefined): boolean => {
  if (characterId === undefined) return false;
  const lock = findKitStatus(effects, characterId, KIT_SWAP_LOCK_ID);
  return lock !== undefined && lock.secondsRemaining > 0;
};
