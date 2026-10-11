import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";

// Starts a cooldown, a status of an id on a character for its seconds, unless one is still running, and returns whether
// It started, so a gate on a repeat is one call. One that runs out on a step lets the gate through on it, though the step
// Drops it later, as gcsim's StatusIsActive reads a status's expiry
export const startKitCooldown = (
  kitEffectState: KitEffectState,
  characterId: number,
  id: string,
  secondsRemaining: number,
): boolean => {
  if (checkIsKitStatusActive(kitEffectState.effects, characterId, id)) return false;
  addKitStatus(kitEffectState, characterId, { id, secondsRemaining });
  return true;
};
