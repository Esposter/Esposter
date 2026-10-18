import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";

import { CraftingRecipeKind } from "#src/models/crafting/CraftingRecipeKind";
import { CONVERSION_TAB_ID_OFFSET } from "#src/services/crafting/constants";

// The id of the bench tab a recipe is listed under: its combine type's, or for a conversion its combine type's in the
// Conversion section, so a conversion never shares the craft tab of the combine type the table files it under
export const getCraftingTabId = (recipe: CraftingRecipe): number =>
  recipe.kind === CraftingRecipeKind.Convert ? CONVERSION_TAB_ID_OFFSET + recipe.combineType : recipe.combineType;
