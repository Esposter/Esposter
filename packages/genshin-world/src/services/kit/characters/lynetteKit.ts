import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";

// The Bogglecat Box stands 1.8 metres ahead of the body, as gcsim (MIT) lynette/burst.go sets it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lynette
const BOGGLECAT_BOX_OFFSET_METRES = 1.8;
// Sophisticated Synergy, Lynette's Ascension 1 passive as gcsim v2.47.2 (MIT) lynette/asc.go gives it: Magic Trick gives the
// Team 8% ATK for one Elemental Type in the party, 4% more for each further type, for 10 seconds, counted as it is cast
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lynette
const ASCENSION_1 = 1;
const SYNERGY_ATTACK_BONUS = 0.08;
const SYNERGY_ATTACK_BONUS_PER_EXTRA_TYPE = 0.04;
const SYNERGY_SECONDS = 10;
const CONSTELLATION_4 = 4;

export const LYNETTE_CHARACTER_ID = 10_000_083;

// Lynette's behaviour: Magic Trick: Astonishing Shift casts the Bogglecat Box ahead of the body, which strikes round its
// Place on each tick, wherever the body stands. Not built yet: Hold E, its Shadowsign and release strike, which hold for as
// Long as the press is held, and its aligned attack, whose Surging Blade lands only off a ten-second cooldown, both of
// Which need a hold whose hit lands at its held time and a conditional hit. The Bogglecat Box's vivid shots, which absorb
// The Cryo, Pyro, Hydro and Electro of an enemy hit and set it off, and its absorb check, and her heal and HP drain on
// Enigmatic Feint, which read her own HP. Sophisticated Synergy is built from Ascension 1; her Ascension 4 passive and
// Constellations 1, 2 and 6 are not built, and Constellation 4 adds a skill charge
// Constellation 1 needs Enigma Thrust's Shadowsign hit and the vortex it makes, which Hold E does not build
// Constellation 2 needs the Bogglecat Box's Vivid Shots, which the kit does not build
// Constellation 6 needs Enigma Thrust's Anemo infusion and DMG Bonus, which Hold E does not build
export const createLynetteKitBehaviour = ({ readHit, readSeconds }: KitRecordReader): KitBehaviour => {
  const bogglecatTick = readHit("bogglecatTick");
  const bogglecatFirstTickSeconds = readSeconds("bogglecatFirstTick");
  const bogglecatTickIntervalSeconds = readSeconds("bogglecatTickInterval");
  const bogglecatBoxSeconds = readSeconds("bogglecatBoxDuration");
  return {
    burst: {
      // Each tick strikes from the box's place, which holds as the burst starts
      onStart: ({ activeCombatant: combatant, body, characterIdCombatantMap, kitEffectState, party }) => {
        if (combatant.ascension >= ASCENSION_1) {
          const elementTypeCount = new Set(
            getDeployedCombatants(party, characterIdCombatantMap).flatMap(({ element }) =>
              element === undefined ? [] : [element],
            ),
          ).size;
          buffKitTeam(kitEffectState, party, {
            amount: SYNERGY_ATTACK_BONUS + (elementTypeCount - 1) * SYNERGY_ATTACK_BONUS_PER_EXTRA_TYPE,
            attribute: Attribute.AttackPercent,
            secondsRemaining: SYNERGY_SECONDS,
            source: "lynette-sophisticated-synergy",
          });
        }
        const box = createAheadBody(body, BOGGLECAT_BOX_OFFSET_METRES);
        castKitField(kitEffectState, combatant.characterId, box.position, {
          nextTickSeconds: bogglecatFirstTickSeconds,
          onTick: ({ kitEffectState: tickKitEffectState }) =>
            castKitSummon(tickKitEffectState, box, combatant, [bogglecatTick]),
          secondsRemaining: bogglecatBoxSeconds,
          tickIntervalSeconds: bogglecatTickIntervalSeconds,
        });
      },
    },
    getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_4 ? 1 : 0),
  };
};
