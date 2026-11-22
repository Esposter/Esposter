import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { generateKitNightsoulPoints } from "#src/services/kit/effects/generateKitNightsoulPoints";

export const MAVUIKA_CHARACTER_ID = 10_000_106;

const CONSTELLATION_1 = 1;

// Mavuika's behaviour: her skill's press enters the Nightsoul Blessing with her points at their maximum, and a press while
// In it refills them, as gcsim's enterNightsoulOrRegenerate does. Not built: the blessing's Ring of Searing Radiance, the
// Drain's pause while her burst lasts and its extra drain on the bike and in the charged attack, Sunfell Slice paid in
// Fighting Spirit, and the points her strikes generate. Her strikes outside the blessing, her charged attack and her plunges
// Are her record's alone
// Constellation 1's points are built; its Fighting Spirit is not, which the kit does not build
// Constellation 2 needs its Nightsoul effect, which the kit does not build
// Constellation 4 needs her Ascension talent Kiongozi, which is not built
// Constellation 6 needs the All-Fire Armaments of The Named Moment, which the kit does not build
// Her Nightsoul points are held at the record's maximum, 80, or 120 from Constellation 1, as gcsim (MIT) mavuika/cons.go's
// c1Init sets them, and her blessing drains them at the record's rate, as gcsim mavuika/skill.go does
export const createMavuikaKitBehaviour = ({ readParameter }: KitRecordReader): KitBehaviour => {
  const nightsoulPoints = readParameter("nightsoulPoints");
  const nightsoulPointsWithC1 = readParameter("nightsoulPointsWithC1");
  const nightsoulDrainPerSecond = readParameter("nightsoulDrainPerSecond");
  return {
    skill: {
      onStart: (context) => {
        const { activeCombatant, kitEffectState } = context;
        const { characterId, constellationCount } = activeCombatant;
        const maximum = constellationCount < CONSTELLATION_1 ? nightsoulPoints : nightsoulPointsWithC1;
        if (checkHasKitStatus(kitEffectState.effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID))
          generateKitNightsoulPoints(context, maximum, maximum);
        else
          enterKitNightsoulBlessing(kitEffectState, characterId, {
            nightsoulRate: { maximum, perSecond: -nightsoulDrainPerSecond },
            points: maximum,
            secondsRemaining: Number.POSITIVE_INFINITY,
          });
      },
    },
  };
};
