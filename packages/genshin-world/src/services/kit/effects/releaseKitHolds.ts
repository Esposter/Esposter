import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { checkIsKitHold } from "#src/services/kit/effects/checkIsKitHold";

// Ends every hold of a passive's id a character has at once, and returns how many it ended
export const releaseKitHolds = (kitEffectState: KitEffectState, characterId: number, id: string): number => {
  let released = 0;
  for (const effect of kitEffectState.effects)
    if (checkIsKitHold(effect, characterId, id)) {
      effect.secondsRemaining = 0;
      released++;
    }
  return released;
};
