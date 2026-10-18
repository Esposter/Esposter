import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const MUALANI_CHARACTER_ID = 10_000_102;

// Mualani's behaviour: none of her own, since her three strikes, charged attack, plunges and Boomsharka-laka, its damage
// A share of her Max HP, are her record's alone. The Nightsoul Blessing her skill's press starts, with its Sharky's
// Bite, is not built, so the press has no hit, and its cooldown runs from the press where gcsim runs it from the
// Blessing's end. She has no plunge in gcsim, so each plunge hits as its action starts
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/mualani
// Constellation 1 needs the Nightsoul's Blessing and its first Surfing Bite, which the kit does not build
// Constellation 2 needs the Wave Momentum stacks and Puffers, which the kit does not build
// Constellation 4 needs Puffers and the Energy they restore, which the kit does not build
// Constellation 6 needs Constellation 1's increase, which the kit does not build
export const createMualaniKitBehaviour = (): KitBehaviour => ({});
