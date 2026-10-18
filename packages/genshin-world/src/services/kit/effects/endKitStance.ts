import type { KitEffect } from "#src/models/kit/KitEffect";

import { findKitStance } from "#src/services/kit/effects/findKitStance";

// Ends the stance a character holds by running its seconds out, so the step that runs next drops it with the effects
// That ran out
export const endKitStance = (effects: readonly KitEffect[], characterId: number): void => {
  const stance = findKitStance(effects, characterId);
  if (stance) stance.secondsRemaining = 0;
};
