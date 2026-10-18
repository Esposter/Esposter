import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";

// Spends an amount of a resource a character holds, leaving the rest with the seconds it runs for, and reports whether it
// Held the amount at all
export const consumeKitResource = (
  kitEffectState: KitEffectState,
  characterId: number,
  id: string,
  amount: number,
): boolean => {
  const status = findKitStatus(kitEffectState.effects, characterId, id);
  const held = countKitResource(kitEffectState.effects, characterId, id);
  if (status === undefined || held < amount) return false;
  if (held === amount) spendKitResource(kitEffectState, characterId, id);
  else
    addKitStatus(kitEffectState, characterId, { id, secondsRemaining: status.secondsRemaining, stacks: held - amount });
  return true;
};
