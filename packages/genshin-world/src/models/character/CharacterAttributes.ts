import type { Attribute } from "#src/models/character/Attribute";

// A character's attributes as its Attributes tab shows them: every attribute's total over all it carries, its starting
// Values included, and the three the game builds from a base, each its base raised by its percentage, plus its flat
export interface CharacterAttributes {
  attack: number;
  attributeTotalMap: Record<Attribute, number>;
  defense: number;
  maxHealth: number;
}
