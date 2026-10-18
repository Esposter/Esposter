import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { NIGHTSOUL_POINTS_ID } from "#src/services/kit/constants";
import { countKitResource } from "#src/services/kit/effects/countKitResource";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";

export const CITLALI_CHARACTER_ID = 10_000_107;

// Her Nightsoul points hold 100 at most. Her burst gives 24, and her skill's press enters the Blessing for 20 seconds with
// Its points plus 24, as gcsim (MIT) citlali/burst.go and skill.go do
const NIGHTSOUL_MAXIMUM = 100;
const NIGHTSOUL_BURST_POINTS = 24;
const NIGHTSOUL_SKILL_POINTS = 24;
const NIGHTSOUL_BLESSING_SECONDS = 20;

// Citlali's behaviour: her skill's press enters the Nightsoul Blessing for 20 seconds with its points plus 24, and her burst
// Gives 24 points. Not built: the Opal Fire state, which drains eight points a second and summons Itzpapa's hits once her
// Points reach 50 in the Blessing, the skulls her burst summons on enemies within 7 metres, which the burst's start cannot
// Place since it reads no enemies but its target, and Itzpapa itself, all of which wait on the summons' enemy placement
// The skill's 18-frame delay before the Blessing enters is not held, and the Ascension and constellation points are not built
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/citlali/burst.go
// Constellation 1 needs Dawnfrost Darkstar's Opalstar Vestments, which waits on Itzpapa's field, not built
// Constellation 2 needs the Opal Shield and Itzpapa's following, which are not built, for their Elemental Mastery
// Constellation 4 needs Itzpapa's Frostfall Storm hits, which are not built, to summon the Obsidian Spiritvein
// Constellation 6 needs Itzpapa's Opal Fire state and the Nightsoul points, which wait on the Opal Fire state
export const createCitlaliKitBehaviour = (): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant, kitEffectState }) =>
      gainKitResource(
        kitEffectState,
        activeCombatant.characterId,
        NIGHTSOUL_POINTS_ID,
        NIGHTSOUL_BURST_POINTS,
        NIGHTSOUL_MAXIMUM,
      ),
  },
  skill: {
    onStart: ({ activeCombatant, kitEffectState }) => {
      const { characterId } = activeCombatant;
      enterKitNightsoulBlessing(kitEffectState, characterId, {
        points: countKitResource(kitEffectState.effects, characterId, NIGHTSOUL_POINTS_ID) + NIGHTSOUL_SKILL_POINTS,
        secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
      });
    },
  },
});
