import type { CraftingTalentEffect } from "#src/models/crafting/CraftingTalentEffect";

// A crafting talent: the chance each craft of a recipe of one of its combine types draws its effect, and the effect
export interface CraftingTalent {
  chance: number;
  combineTypes: readonly number[];
  effect: CraftingTalentEffect;
}
