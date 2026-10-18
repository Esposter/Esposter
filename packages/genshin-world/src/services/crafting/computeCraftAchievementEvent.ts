import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// The doing a craft of a recipe is: the items it made, counted by the recipe's combine type, which a crafting trigger names
export const computeCraftAchievementEvent = (recipe: CraftingRecipe, craftCount: number): AchievementEvent => ({
  kind: AchievementEventKind.ItemCrafted,
  quantity: recipe.resultCount * craftCount,
  targetId: String(recipe.combineType),
});
