import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const MUALANI_CHARACTER_ID = 10_000_102;

// Mualani's behaviour: none of her own, since her three strikes, charged attack, plunges and Boomsharka-laka, its damage
// A share of her Max HP, are her record's alone. The Nightsoul Blessing her skill's press starts, with its Sharky's
// Bite, is not built, so the press has no hit, and its cooldown runs from the press where gcsim runs it from the
// Blessing's end. She has no plunge in gcsim, so each plunge hits as its action starts
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/mualani
export const createMualaniKitBehaviour = (): KitBehaviour => ({});
