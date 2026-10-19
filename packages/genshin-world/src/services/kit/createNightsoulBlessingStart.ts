import type { KitAction } from "#src/models/kit/KitAction";

import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { exitKitNightsoulBlessing } from "#src/services/kit/effects/exitKitNightsoulBlessing";

// The start of a skill that toggles its character's Nightsoul's Blessing: it exits the blessing the character is in,
// Or else enters one with the points given, which drain at the rate given until the skill exits it
export const createNightsoulBlessingStart =
  (points: number, drainPerSecond: number): NonNullable<KitAction["onStart"]> =>
  ({ activeCombatant, kitEffectState }) => {
    const { characterId } = activeCombatant;
    if (checkHasKitStatus(kitEffectState.effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID))
      exitKitNightsoulBlessing(kitEffectState, characterId);
    else
      enterKitNightsoulBlessing(kitEffectState, characterId, {
        nightsoulRate: { maximum: points, perSecond: -drainPerSecond },
        points,
        secondsRemaining: Number.POSITIVE_INFINITY,
      });
  };
