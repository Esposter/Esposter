import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Changes a cooldown a character has running by its seconds: a negative number cuts it short, a positive one lengthens it,
// And one that the change leaves at zero has run out, which the step drops. A cooldown that is not running is left alone,
// So a constellation that resets a cooldown is one call with its remaining seconds. Returns whether one was running
export const changeKitCooldown = (
  kitEffectState: KitEffectState,
  characterId: number,
  id: string,
  seconds: number,
): boolean => {
  const status = findKitStatus(kitEffectState.effects, characterId, id);
  if (!status || status.secondsRemaining <= 0) return false;
  status.secondsRemaining = Math.max(0, status.secondsRemaining + seconds);
  return true;
};
