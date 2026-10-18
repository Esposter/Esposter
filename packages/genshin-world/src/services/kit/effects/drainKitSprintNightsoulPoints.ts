import type { KitContext } from "#src/models/kit/KitContext";
import type { KitState } from "#src/models/kit/KitState";

import { drainKitNightsoulPoints } from "#src/services/kit/effects/drainKitNightsoulPoints";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";

// Drains a sprint's points from the Nightsoul Blessing its character holds, once, on the step the sprint starts, as
// Gcsim's dash does with its one reduction. The sprint's seconds equal the step's only on that step, so each step after
// It drains nothing
export const drainKitSprintNightsoulPoints = (
  { activeCombatant: { characterId }, kitEffectState }: KitContext,
  kitState: KitState,
  stepSeconds: number,
  amount: number,
): void => {
  if (kitState.sprintSeconds === stepSeconds && hasKitNightsoulBlessing(kitEffectState.effects, characterId))
    drainKitNightsoulPoints(kitEffectState, characterId, amount);
};
