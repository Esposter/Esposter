import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";

export const NEUVILLETTE_CHARACTER_ID = 10_000_087;

// Measured: gcsim v2.47.2 (MIT) neuvillette/asc.go, Ascension 4 gives a Hydro DMG Bonus of 0.6 for each unit of HP share
// Above 30%, at most 30%
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/neuvillette/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_HEALTH_SHARE_FLOOR = 0.3;
const ASCENSION_4_HYDRO_DAMAGE_BONUS_PER_HEALTH_SHARE = 0.6;
const ASCENSION_4_HYDRO_DAMAGE_BONUS_MAX = 0.3;

// Ascension 4's Hydro DMG Bonus, read from the character's HP as a share of its Max HP, as a passive bonus is priced
const getPassiveBonuses = (combatant: Combatant, healthShare: number): { amount: number; attribute: Attribute }[] =>
  combatant.ascension < ASCENSION_4
    ? []
    : [
        {
          amount: Math.min(
            ASCENSION_4_HYDRO_DAMAGE_BONUS_MAX,
            Math.max(
              0,
              (healthShare - ASCENSION_4_HEALTH_SHARE_FLOOR) * ASCENSION_4_HYDRO_DAMAGE_BONUS_PER_HEALTH_SHARE,
            ),
          ),
          attribute: Attribute.HydroDamageBonus,
        },
      ];

// Neuvillette's behaviour: his strikes, the short charged attack, his plunges, O Tears, I Shall Repay with its Spiritbreath
// Thorn and O Tides, I Have Returned with its Waterfalls are his record's alone. Spiritbreath Thorn's aligned 10-second
// Cooldown is not built, as the skill's own twelve seconds always outlast it. Ascension 4's Hydro DMG Bonus is built. Not
// Built yet: Equitable Judgment, the held charged attack, whose length counts the Sourcewater droplets its legal evaluation
// Picks up and whose judgement ticks drain Max HP, and Ascension 1, which raises that charge by the reactions it counts,
// And the droplets the skill and burst leave, which nothing collects. His constellations are not built
// Constellation 1 needs Past Draconic Glories from the Ascension talent Heir to the Ancient Sea's Authority, not built
// Constellation 2 needs that Ascension talent's CRIT DMG per Past Draconic Glories, which the kit does not build
// Constellation 4 needs Sourcewater Droplets generated when he is healed, which the kit does not build
// Constellation 6 needs Sourcewater Droplets and the Equitable Judgment currents, which the kit does not build
export const createNeuvilletteKitBehaviour = (): KitBehaviour => ({ getPassiveBonuses });
