import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";

// The records a screen open over the world reads, each read the first time its screen opens and held after, so the
// World's first frame reads none of them
export interface ScreenRecords {
  // The bench's recipes in the game's order, which the crafting screen offers the learned ones of
  craftingRecipes: CraftingRecipe[];
}
