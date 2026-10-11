import type { LunarReactionType } from "#src/models/combat/LunarReactionType";

// How an element is applied beyond its element and gauge: the Lunar reactions the applying party's Moonsign turns its
// Reactions into, the seconds it lasts as a self aura, an element put on with no attack, and the id of the character
// Applying it, whose share of the aura it leaves is kept as one of the aura's sources
export interface ElementApplication {
  lunarReactionTypes?: readonly LunarReactionType[];
  selfAuraSeconds?: number;
  sourceId?: number;
}
