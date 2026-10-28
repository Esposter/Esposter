import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { NIGHTSOUL_BLESSING_STATUS_ID, NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { generateKitNightsoulPoints } from "#src/services/kit/effects/generateKitNightsoulPoints";

export const VARESA_CHARACTER_ID = 10_000_111;

// Her Nightsoul points hold 40 at most. Her skill's press gives 20 and a high or low plunge 25, and her burst fills them,
// And a full set outside the Blessing enters it for 15 seconds with its points, as gcsim (MIT) varesa/varesa.go's plunge
// Gain and varesa/burst.go do. Her skill's gain only adds points, as gcsim's does
const NIGHTSOUL_MAXIMUM = 40;
const NIGHTSOUL_SKILL_POINTS = 20;
const NIGHTSOUL_PLUNGE_POINTS = 25;
const NIGHTSOUL_BLESSING_SECONDS = 15;

// Enters the Blessing once her points are full, if she is not in it, with those points, as gcsim's plunge gain enters
// It, which her plunges and burst reach
const enterNightsoulAtMaximum = (kitEffectState: KitEffectState, characterId: number): void => {
  if (
    checkHasKitStatus(kitEffectState.effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID) ||
    countKitResource(kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID) !== NIGHTSOUL_MAXIMUM
  )
    return;
  enterKitNightsoulBlessing(kitEffectState, characterId, {
    points: NIGHTSOUL_MAXIMUM,
    secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
  });
};

// Fills her points to their maximum and enters the Blessing, as her burst and its Fiery Passion Flying Kick both do
const fillNightsoulPoints = (context: KitContext): void => {
  generateKitNightsoulPoints(context, NIGHTSOUL_MAXIMUM, NIGHTSOUL_MAXIMUM);
  enterNightsoulAtMaximum(context.kitEffectState, context.activeCombatant.characterId);
};

// Gains a plunge's points up to their maximum and enters the Blessing, as her high and low plunges both do
const gainNightsoulPlungePoints = (context: KitContext): void => {
  generateKitNightsoulPoints(context, NIGHTSOUL_PLUNGE_POINTS, NIGHTSOUL_MAXIMUM);
  enterNightsoulAtMaximum(context.kitEffectState, context.activeCombatant.characterId);
};

// Varesa's behaviour outside her Blessing: her Nightsoul points, the Blessing a full set enters for 15 seconds, from her
// Skill's press, her high and low plunges and her burst, as gcsim's do. Her burst inside the Blessing is the Fiery Passion
// Flying Kick, which gcsim checks the Blessing for at the cast (burst.go:68). Not built: the Fiery Passion Rush, which
// Replaces Rush in the Blessing and needs a skill variant the kit lacks, and the apex state with its Volcanic Kablam and
// The Follow-Up Strike after Rush. The points land at each action's start, where gcsim lands them at
// Their hitmarks, and her free Rush after a plunge enters the Blessing is not built, so its cooldown is not waived
// Constellation 1 needs the Ascension talent Tag-Team Triple Jump's enhancement, which the kit does not build
// Constellation 2 needs Apex Drive after a Plunging Attack, which the kit does not build
// Constellation 4 needs the buffs by Varesa's state on Guardian Vent, which the kit does not build
// Constellation 6 needs Apex Drive's Energy and a CRIT DMG bonus, which no strike hook can apply here
export const createVaresaKitBehaviour = (): KitBehaviour => ({
  burst: { onStart: fillNightsoulPoints },
  burstVariant: {
    checkIsActive: ({ activeCombatant, kitEffectState }) =>
      checkHasKitStatus(kitEffectState.effects, activeCombatant.characterId, NIGHTSOUL_BLESSING_STATUS_ID),
    onStart: fillNightsoulPoints,
  },
  plunges: { high: { onStart: gainNightsoulPlungePoints }, low: { onStart: gainNightsoulPlungePoints } },
  skill: {
    onStart: (context) => {
      generateKitNightsoulPoints(context, NIGHTSOUL_SKILL_POINTS, NIGHTSOUL_MAXIMUM);
    },
  },
});
