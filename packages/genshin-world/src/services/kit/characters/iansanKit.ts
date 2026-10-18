import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";

export const IANSAN_CHARACTER_ID = 10_000_110;

// Her Nightsoul points are set to 54 as her blessing is entered, which lasts 16 seconds, as gcsim (MIT) iansan/skill.go and
// Iansan.go set them, and her blessing drains 0.6 points every six frames, six a second (nightsoulPointReduceTask)
const NIGHTSOUL_POINTS = 54;
const NIGHTSOUL_BLESSING_SECONDS = 16;
const NIGHTSOUL_DRAIN_PER_SECOND = 6;

// Iansan's behaviour: her skill's press enters the Nightsoul Blessing with its points, which drain six a second for the 16
// Seconds it lasts. gcsim ends the blessing when the points fall to 0.2, and the kit ends it when they reach none, a gap of
// A thirtieth of a second. Not built: the Electro Swift Stormflight that swaps her charged attack in the blessing, the burst's
// Party ATK bonus and its conversion of the points into ATK, and the points her Ascension and constellations add. Her
// Strikes and plunges are her record's alone
export const createIansanKitBehaviour = (): KitBehaviour => ({
  skill: {
    onStart: ({ activeCombatant, kitEffectState }) =>
      enterKitNightsoulBlessing(kitEffectState, activeCombatant.characterId, {
        nightsoulRate: { maximum: NIGHTSOUL_POINTS, perSecond: -NIGHTSOUL_DRAIN_PER_SECOND },
        points: NIGHTSOUL_POINTS,
        secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
      }),
  },
});
