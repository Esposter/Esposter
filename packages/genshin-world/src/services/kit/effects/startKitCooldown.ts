import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";

// Starts a cooldown, a status of an id on a character for its seconds, unless one is already running, and returns whether
// It started, so a gate on a repeat is one call
export const startKitCooldown = (
  kitEffectState: KitEffectState,
  characterId: number,
  id: string,
  secondsRemaining: number,
): boolean => {
  if (checkHasKitStatus(kitEffectState.effects, characterId, id)) return false;
  addKitStatus(kitEffectState, characterId, { id, secondsRemaining });
  return true;
};
