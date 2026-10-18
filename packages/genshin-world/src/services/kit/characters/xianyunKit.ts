import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";

export const XIANYUN_CHARACTER_ID = 10_000_093;

const CONSTELLATION_1 = 1;
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_ATTACK_SHARE = 0.2;
const CONSTELLATION_2_SECONDS = 15;
const CONSTELLATION_2_SOURCE = "xianyun-constellation-2";

// Xianyun's behaviour: none of her own, since her four strikes, charged attack, plunges, Skyladder's first press and
// Stars Gather at Dusk's hit are her record's alone. Driftcloud Wave, her two further Skyladder presses, Starwicker, the
// Burst's heals, her airborne buff, her passives and Constellations 4 and 6 are not built
// Constellation 1's charge is built
// Constellation 2's ATK buff from White Clouds at Dawn is built
// Constellation 4 needs the Skyladder count in one Cloud Transmogrification, which the kit does not build
// Constellation 6 needs a CRIT DMG bonus on the Driftcloud Wave, which no strike hook can apply here
export const createXianyunKitBehaviour = (): KitBehaviour => ({
  // Purifying Wind, from Constellation 1: White Clouds at Dawn gains one more charge
  getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_1 ? 1 : 0),
  skill: {
    // Constellation 2: each White Clouds at Dawn gives Xianyun 20% ATK for 15 seconds, and a press restarts that buff
    onStart: ({ activeCombatant, kitEffectState }) => {
      if (activeCombatant.constellationCount < CONSTELLATION_2) return;

      buffKitMember(kitEffectState, activeCombatant.characterId, {
        amount: CONSTELLATION_2_ATTACK_SHARE,
        attribute: Attribute.AttackPercent,
        secondsRemaining: CONSTELLATION_2_SECONDS,
        source: CONSTELLATION_2_SOURCE,
      });
    },
  },
});
