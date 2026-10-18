import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { consumeKitResource } from "#src/services/kit/effects/consumeKitResource";
import { countKitResource } from "#src/services/kit/effects/countKitResource";

// Drains up to the amount of Nightsoul points a character holds and returns what it drained, never below none, as gcsim
// (MIT) nightsoul/nightsoul.go ConsumePoints does. The step ends a blessing that drains to none, not this call
export const drainKitNightsoulPoints = (
  kitEffectState: KitEffectState,
  characterId: number,
  amount: number,
): number => {
  const drained = Math.min(countKitResource(kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID), amount);
  consumeKitResource(kitEffectState, characterId, NIGHTSOUL_POINTS_ID, drained);
  return drained;
};
