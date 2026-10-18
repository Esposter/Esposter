import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { gainKitNightsoulPoints } from "#src/services/kit/effects/gainKitNightsoulPoints";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";

export const VARESA_CHARACTER_ID = 10_000_111;

// Her Nightsoul points hold 40 at most. Her skill's press gives 20 and a high or low plunge 25, and her burst fills them,
// And a full set outside the Blessing enters it for 15 seconds with its points, as gcsim (MIT) varesa/varesa.go's plunge
// Gain and varesa/burst.go do. Her skill's gain only adds points, as gcsim's does
const NIGHTSOUL_MAXIMUM = 40;
const NIGHTSOUL_SKILL_POINTS = 20;
const NIGHTSOUL_PLUNGE_POINTS = 25;
const NIGHTSOUL_BLESSING_SECONDS = 15;

// Gains her points up to her maximum, and raises the points it added as a generation event, as gcsim's GeneratePoints does
const gainNightsoulPoints = (context: KitContext, points: number): void => {
  const { activeCombatant, kitEffectState } = context;
  const { characterId } = activeCombatant;
  const gained = gainKitNightsoulPoints(kitEffectState, characterId, points, NIGHTSOUL_MAXIMUM);
  if (gained > 0) emitKitEvent({ characterId, kind: KitEventKind.NightsoulPointsGained, points: gained }, context);
};

// Enters the Blessing once her points are full, if she is not in it, with those points, as gcsim's plunge gain enters
// It, which her plunges and burst reach
const enterNightsoulAtMaximum = (kitEffectState: KitEffectState, characterId: number): void => {
  if (
    hasKitNightsoulBlessing(kitEffectState.effects, characterId) ||
    countKitResource(kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID) !== NIGHTSOUL_MAXIMUM
  )
    return;
  enterKitNightsoulBlessing(kitEffectState, characterId, {
    points: NIGHTSOUL_MAXIMUM,
    secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
  });
};

// Varesa's behaviour outside her Blessing: her Nightsoul points, the Blessing a full set enters for 15 seconds, from her
// Skill's press, her high and low plunges and her burst, as gcsim's do. Not built: the Fiery Passion forms, which replace
// Rush, Flying Kick and Volcanic Kablam in the Blessing and need a skill variant the kit lacks, and the apex state with its
// Volcanic Kablam and the Follow-Up Strike after Rush. The points land at each action's start, where gcsim lands them at
// Their hitmarks, and her free Rush after a plunge enters the Blessing is not built, so its cooldown is not waived
// Constellation 1 needs the Ascension talent Tag-Team Triple Jump's enhancement, which the kit does not build
// Constellation 2 needs Apex Drive after a Plunging Attack, which the kit does not build
// Constellation 4 needs the buffs by Varesa's state on Guardian Vent, which the kit does not build
// Constellation 6 needs Apex Drive's Energy and a CRIT DMG bonus, which no strike hook can apply here
export const createVaresaKitBehaviour = (): KitBehaviour => ({
  burst: {
    onStart: (context) => {
      const { activeCombatant, kitEffectState } = context;
      gainNightsoulPoints(context, NIGHTSOUL_MAXIMUM);
      enterNightsoulAtMaximum(kitEffectState, activeCombatant.characterId);
    },
  },
  plunges: {
    high: {
      onStart: (context) => {
        const { activeCombatant, kitEffectState } = context;
        gainNightsoulPoints(context, NIGHTSOUL_PLUNGE_POINTS);
        enterNightsoulAtMaximum(kitEffectState, activeCombatant.characterId);
      },
    },
    low: {
      onStart: (context) => {
        const { activeCombatant, kitEffectState } = context;
        gainNightsoulPoints(context, NIGHTSOUL_PLUNGE_POINTS);
        enterNightsoulAtMaximum(kitEffectState, activeCombatant.characterId);
      },
    },
  },
  skill: { onStart: (context) => gainNightsoulPoints(context, NIGHTSOUL_SKILL_POINTS) },
});
