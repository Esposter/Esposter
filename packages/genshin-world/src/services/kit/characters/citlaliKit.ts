import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const CITLALI_CHARACTER_ID = 10_000_107;

// Citlali's behaviour: none of her own, since her three strikes, charged attack, Obsidian Tzitzimitl's hit, Ice Storm and
// Her collision, low and high plunges are her record's alone. Her skill's Itzpapa and Opal Shield and her burst's skulls
// Wait on their hooks: each skull is summoned on an enemy within 7 of Citlali and lands at a random time from 87 to 117
// Frames after Ice Storm's hit, which the burst's start could draw, but the start reads no enemies but its target. Her
// Passives wait on the Nightsoul hook
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/citlali/burst.go
// Constellation 1 needs Dawnfrost Darkstar's Opalstar Vestments, which waits on Itzpapa's field, not built
// Constellation 2 needs the Opal Shield and Itzpapa's following, which are not built, for their Elemental Mastery
// Constellation 4 needs Itzpapa's Frostfall Storm hits, which are not built, to summon the Obsidian Spiritvein
// Constellation 6 needs Itzpapa's Opal Fire state and the Nightsoul points, which wait on the Nightsoul hook
export const createCitlaliKitBehaviour = (): KitBehaviour => ({});
