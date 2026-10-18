import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";

// Spends an amount of a resource a character holds, leaving the rest, and reports whether it held the amount at all
export const consumeKitResource = (
  kitEffectState: KitEffectState,
  characterId: number,
  id: string,
  amount: number,
): boolean => {
  const held = countKitResource(kitEffectState.effects, characterId, id);
  if (held < amount) return false;
  spendKitResource(kitEffectState, characterId, id);
  gainKitResource(kitEffectState, characterId, id, held - amount, held);
  return true;
};
