import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { spendKitResource } from "#src/services/kit/effects/spendKitResource";

// Drains up to the amount of Nightsoul points a character holds and returns what it drained, never below none, as gcsim
// (MIT) nightsoul/nightsoul.go ConsumePoints does. The step ends a blessing that drains to none, not this call
export const drainKitNightsoulPoints = (
  kitEffectState: KitEffectState,
  characterId: number,
  amount: number,
): number => {
  const held = countKitResource(kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID);
  const drained = Math.min(held, amount);
  if (drained === held) spendKitResource(kitEffectState, characterId, NIGHTSOUL_POINTS_ID);
  else
    addKitStatus(kitEffectState, characterId, {
      id: NIGHTSOUL_POINTS_ID,
      secondsRemaining: Number.POSITIVE_INFINITY,
      stacks: held - drained,
    });
  return drained;
};
