import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";

export const IFA_CHARACTER_ID = 10_000_113;

// Constellation 4, Decayed Vessel's Permutation: after her burst, Elemental Mastery is raised by this much
const CONSTELLATION_4_ELEMENTAL_MASTERY = 100;
const CONSTELLATION_4_SECONDS = 15;

// Ifa's behaviour outside her Nightsoul Blessing: none of her own, since her three normal attacks, charged attack,
// Compound Sedation Field's hit, and her low and collision plunges are her record's alone, and her skill's press a
// Placeholder spending its cooldown, as Mavuika's does. Her Tonic Shot, healing, sedation marks and passives
// Wait on the Nightsoul hook and the sedation-mark hook, and the low plunge, which gcsim plays only after
// The Nightsoul Blessing ends, is not gated. Her high plunge is borrowed as the page records
// Constellation 1 needs Supporting Fire, the normal attacks of Nightsoul's Blessing, which the state does not give yet
// Constellation 2 needs the party's Nightsoul points above 60 and the Rescue Essentials, neither built
// Constellation 4's Elemental Mastery is built at the burst's start, but its wind current lasts three seconds more,
// Which waits on a restraining field the burst lacks
// Constellation 6 needs the Hold of Supporting Fire and its Nightsoul's Blessing turns, which the kit does not build
export const createIfaKitBehaviour = (): KitBehaviour => ({
  burst: {
    onStart: ({ activeCombatant: combatant, kitEffectState }) => {
      if (combatant.constellationCount >= 4)
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: CONSTELLATION_4_ELEMENTAL_MASTERY,
          attribute: Attribute.ElementalMastery,
          secondsRemaining: CONSTELLATION_4_SECONDS,
        });
    },
  },
});
