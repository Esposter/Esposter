import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { CraftingCell } from "genshin-interface";

import { checkIsRecipeOpen } from "#src/services/crafting/checkIsRecipeOpen";
import { getItemName } from "#src/services/inventory/getItemName";

// The recipes of one combine type the player has learned, in the game's order, each named and with the count crafted
// So far, none for one never crafted. A recipe an instruction opens is left out until the player has learned it
export const computeLearnedRecipeCells = (
  recipes: readonly CraftingRecipe[],
  {
    adventureRank,
    combineType,
    craftedCountMap,
    nameText,
    progress,
  }: {
    adventureRank: number;
    combineType: number;
    craftedCountMap: ReadonlyMap<number, number>;
    nameText: Readonly<Record<string, string>>;
    progress: CraftingProgress;
  },
): CraftingCell[] =>
  recipes
    .filter((recipe) => recipe.combineType === combineType && checkIsRecipeOpen(recipe, progress, adventureRank))
    .map((recipe) => ({
      count: craftedCountMap.get(recipe.id) ?? 0,
      id: recipe.id,
      name: getItemName(recipe.nameTextId, nameText),
    }));
