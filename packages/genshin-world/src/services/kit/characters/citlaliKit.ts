import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const CITLALI_CHARACTER_ID = 10_000_107;

// Citlali's behaviour: none of her own, since her three strikes, charged attack, Obsidian Tzitzimitl's hit, Ice Storm and
// Her collision, low and high plunges are her record's alone. Her skill's Itzpapa and Opal Shield and her burst's skulls
// Wait on their hooks: each skull is summoned on an enemy within 7 of Citlali and lands at a random time from 87 to 117
// Frames after Ice Storm's hit, which the burst's start could draw, but the start reads no enemies but its target. Her
// Passives wait on the Nightsoul hook
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/citlali/burst.go
export const createCitlaliKitBehaviour = (): KitBehaviour => ({});
