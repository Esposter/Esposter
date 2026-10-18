import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const KACHINA_CHARACTER_ID = 10_000_100;

// Kachina's behaviour: none of her own, since her strikes, charged attack, plunges and burst's hit are her record's
// Alone. Her skill's Turbo Twirly, her Nightsoul's Blessing and her passives wait on their hooks, and her record's
// Frames and areas are provisional, read from Xiangling's gcsim hitmarks and the clips' durations.
// Constellation 1 needs Turbo Twirly to absorb nearby Crystallize shards, and the shard pickups, which are not built
// Constellation 2 needs Nightsoul points and Turbo Twirly's return, which wait on the Nightsoul hook
// Constellation 4 needs the count of opponents in Turbo Drill Field and the buff it gives the active character
// Constellation 6 needs the active character's shield replaced or destroyed, and an AoE Geo hit, not built
export const createKachinaKitBehaviour = (): KitBehaviour => ({});
