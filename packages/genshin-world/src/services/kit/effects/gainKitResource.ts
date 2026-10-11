import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";

// Adds an amount of a resource to what a character holds, up to its maximum, and returns what it holds then
export const gainKitResource = (
  kitEffectState: KitEffectState,
  characterId: number,
  id: string,
  amount: number,
  maximum: number,
): number => {
  const held = countKitResource(kitEffectState.effects, characterId, id);
  const total = Math.min(held + amount, maximum);
  if (total !== held)
    addKitStatus(kitEffectState, characterId, { id, secondsRemaining: Number.POSITIVE_INFINITY, stacks: total });
  return total;
};
