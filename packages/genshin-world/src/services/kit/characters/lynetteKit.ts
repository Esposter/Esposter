import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { createAheadBody } from "#src/services/kit/createAheadBody";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";

// The Bogglecat Box stands 1.8 metres ahead of the body, as gcsim (MIT) lynette/burst.go sets it
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/lynette
const BOGGLECAT_BOX_OFFSET_METRES = 1.8;
const CONSTELLATION_4 = 4;

export const LYNETTE_CHARACTER_ID = 10_000_083;

// Lynette's behaviour: Magic Trick: Astonishing Shift casts the Bogglecat Box ahead of the body, which strikes round its
// Place on each tick, wherever the body stands. Not built yet: Hold E, its Shadowsign and release strike, which hold for as
// Long as the press is held, and its aligned attack, whose Surging Blade lands only off a ten-second cooldown, both of
// Which need a hold whose hit lands at its held time and a conditional hit. The Bogglecat Box's vivid shots, which absorb
// The Cryo, Pyro, Hydro and Electro of an enemy hit and set it off, and its absorb check, and her heal and HP drain on
// Enigmatic Feint, which read her own HP. Her Ascension passives and Constellations 1, 2 and 6 are not built either
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
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
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
