import type { KitEffect } from "#src/models/kit/KitEffect";

import { KIT_SWAP_LOCK_ID } from "#src/services/kit/constants";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Ends the stance a character holds, and the swap lock it started, by running their seconds out, so the step that runs
// Next drops them with the effects that ran out
export const endKitStance = (effects: readonly KitEffect[], characterId: number): void => {
  const stance = findKitStance(effects, characterId);
  if (stance) stance.secondsRemaining = 0;
  const lock = findKitStatus(effects, characterId, KIT_SWAP_LOCK_ID);
  if (lock) lock.secondsRemaining = 0;
};
