import type { KitContext } from "#src/models/kit/KitContext";
import type { KitState } from "#src/models/kit/KitState";

import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { drainKitNightsoulPoints } from "#src/services/kit/effects/drainKitNightsoulPoints";

// Drains a sprint's points from the Nightsoul Blessing its character holds, once, on the step the sprint starts, as
// Gcsim's dash does with its one reduction. The sprint's seconds equal the step's only on that step, so each step after
// It drains nothing
export const drainKitSprintNightsoulPoints = (
  { activeCombatant: { characterId }, kitEffectState }: KitContext,
  kitState: KitState,
  stepSeconds: number,
  amount: number,
): void => {
  if (
    kitState.sprintSeconds === stepSeconds &&
    checkHasKitStatus(kitEffectState.effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID)
  )
    drainKitNightsoulPoints(kitEffectState, characterId, amount);
};
