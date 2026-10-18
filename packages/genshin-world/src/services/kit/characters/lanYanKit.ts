import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";

export const LAN_YAN_CHARACTER_ID = 10_000_108;

// Constellation 4 adds 60 Elemental Mastery to each member of the deployed team for 12 seconds as the burst is cast,
// As gcsim (MIT) lanyan/cons.go gives it
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/lanyan/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_6 = 6;
const CONSTELLATION_4_ELEMENTAL_MASTERY = 60;
const CONSTELLATION_4_SECONDS = 12;
const CONSTELLATION_4_SOURCE = "lanyan-c4";

// Lan Yan's behaviour: from Constellation 4, Lustrous Moonrise's cast gives the deployed team its Elemental Mastery. Not
// Built: the Swallow-Wisp Pinion Dance's press, which sets a shield going that absorbs the element it finds on the enemy
// It detects, and its Feathermoon Rings, which play in place of her attacks for 66 frames from that detect. The Rings wait
// On a stance's attack tags, and the shield on the hook that absorbs an element from the field, so the press deals
// Nothing until then, as Constellations 1 and 2 and Ascension 1 and 4 wait on the same two
export const createLanYanKitBehaviour = (): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant: combatant, kitEffectState, party }) => {
      if (combatant.constellationCount < CONSTELLATION_4) return;
      buffKitTeam(kitEffectState, party, {
        amount: CONSTELLATION_4_ELEMENTAL_MASTERY,
        attribute: Attribute.ElementalMastery,
        secondsRemaining: CONSTELLATION_4_SECONDS,
        source: CONSTELLATION_4_SOURCE,
      });
    },
  },
  // Constellation 6 gives the skill one more charge
  getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_6 ? 1 : 0),
});
