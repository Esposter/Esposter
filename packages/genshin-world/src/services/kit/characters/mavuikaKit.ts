import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { hasKitNightsoulBlessing } from "#src/services/kit/effects/hasKitNightsoulBlessing";

export const MAVUIKA_CHARACTER_ID = 10_000_106;

const CONSTELLATION_1 = 1;
// Her Nightsoul points are held at 80, or 120 from Constellation 1, as gcsim (MIT) mavuika/cons.go c1Init sets them
const NIGHTSOUL_POINTS = 80;
const NIGHTSOUL_POINTS_WITH_C1 = 120;
// Her blessing drains half a point every six frames, five a second, as gcsim mavuika/skill.go does
const NIGHTSOUL_DRAIN_PER_SECOND = 5;

// Mavuika's behaviour: her skill's press enters the Nightsoul Blessing with her points at their maximum, and a press while
// In it refills them, as gcsim's enterNightsoulOrRegenerate does. Not built: the blessing's Ring of Searing Radiance, the
// Drain's pause while her burst lasts and its extra drain on the bike and in the charged attack, Sunfell Slice paid in
// Fighting Spirit, and the points her strikes generate. Her strikes outside the blessing, her charged attack and her plunges
// Are her record's alone
export const createMavuikaKitBehaviour = (): KitBehaviour => ({
  skill: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      const { characterId, constellationCount } = activeCombatant;
      const maximum = constellationCount < CONSTELLATION_1 ? NIGHTSOUL_POINTS : NIGHTSOUL_POINTS_WITH_C1;
      if (hasKitNightsoulBlessing(kitEffectState.effects, characterId))
        gainKitResource(kitEffectState, characterId, NIGHTSOUL_POINTS_ID, maximum, maximum);
      else
        enterKitNightsoulBlessing(kitEffectState, characterId, {
          nightsoulRate: { maximum, perSecond: -NIGHTSOUL_DRAIN_PER_SECOND },
          points: maximum,
          secondsRemaining: Number.POSITIVE_INFINITY,
        });
    },
  },
});
