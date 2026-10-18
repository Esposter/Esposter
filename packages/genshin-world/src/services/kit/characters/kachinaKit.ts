import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";

export const KACHINA_CHARACTER_ID = 10_000_100;

// The Weight of Stone, Kachina's Ascension 4 passive: Turbo Twirly's DMG is increased by 20% of her DEF, as the passive's
// Text in the game gives it. Her Ascension 1 passive, Mountain Echoes, waits on the Nightsoul Burst of nearby members, which
// The kit has no event for
const ASCENSION_4 = 4;
const WEIGHT_OF_STONE_DEFENSE_SHARE = 0.2;

// Kachina's behaviour: her strikes, charged attack, plunges and burst's hit are her record's alone, and from Ascension 4
// Turbo Twirly's hits add 20% of her DEF. Her skill's Turbo Twirly, her Nightsoul's Blessing and her other passives wait on
// Their hooks, and her record's frames and areas are provisional, read from Xiangling's gcsim hitmarks and the clips' durations
// Constellation 1 needs Turbo Twirly to absorb nearby Crystallize shards, and the shard pickups, which are not built
// Constellation 2 needs Nightsoul points and Turbo Twirly's return, which wait on the Nightsoul hook
// Constellation 4 needs the count of opponents in Turbo Drill Field and the buff it gives the active character
// Constellation 6 needs the active character's shield replaced or destroyed, and an AoE Geo hit, not built
export const createKachinaKitBehaviour = ({ kit }: KitRecordReader): KitBehaviour => ({
  skill: {
    hits: kit.elementalSkill.hits.map(() => ({
      additiveBaseDamageBonus: ({ ascension, attributes }) =>
        ascension < ASCENSION_4 ? 0 : WEIGHT_OF_STONE_DEFENSE_SHARE * attributes.attributeTotalMap[Attribute.Defense],
    })),
  },
});
