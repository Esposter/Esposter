import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { ItemCount } from "#src/models/inventory/ItemCount";

import { CraftingTalentEffect } from "#src/models/crafting/CraftingTalentEffect";
import { CharacterIdCraftingTalentMap } from "#src/services/crafting/CharacterIdCraftingTalentMap";
import { TalentBookIdOtherSeriesIdsMap } from "#src/services/crafting/TalentBookIdOtherSeriesIdsMap";
import { takeOne } from "@esposter/shared";

// The items a character's crafting talent adds to `count` crafts of a recipe. Each craft draws once, and a draw under
// The talent's chance doubles the recipe's result, refunds one of its first material, or adds the same tier of another
// Talent book series in the book's region. A character with no talent for the recipe's combine type adds nothing
export const rollCraftingTalent = (
  avatarId: number,
  recipe: CraftingRecipe,
  count: number,
  random: () => number,
): ItemCount[] => {
  const talent = CharacterIdCraftingTalentMap[avatarId];
  if (!talent?.combineTypes.includes(recipe.combineType)) return [];
  const [firstMaterial] = recipe.materials;
  return Array.from({ length: count }).flatMap(() => {
    if (random() >= talent.chance) return [];
    if (talent.effect === CraftingTalentEffect.DoubleProduct)
      return [{ count: recipe.resultCount, id: recipe.resultItemId }];
    if (talent.effect === CraftingTalentEffect.Refund && firstMaterial) return [{ count: 1, id: firstMaterial.id }];
    if (talent.effect === CraftingTalentEffect.RegionalTalentMaterial && firstMaterial) {
      const otherSeriesIds = TalentBookIdOtherSeriesIdsMap[firstMaterial.id];
      if (!otherSeriesIds) return [];
      const seriesIndex = Math.floor(random() * otherSeriesIds.length);
      return [{ count: 1, id: takeOne(otherSeriesIds, seriesIndex) }];
    }
    return [];
  });
};
