import type { CookingProgress } from "#src/models/cooking/CookingProgress";
import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";
import type { DishUse } from "#src/models/cooking/DishUse";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { HomeProgress } from "#src/models/home/HomeProgress";

// What a bag entry's Use is read against: the dish each food is eaten as, and the recipe or blueprint each instruction or
// Diagram opens, with the progress each one is learned in
export interface InventoryUseContext {
  blueprintMap: ReadonlyMap<number, HomeBlueprint>;
  cookingProgress: CookingProgress;
  craftingProgress: CraftingProgress;
  craftingRecipeMap: ReadonlyMap<number, CraftingRecipe>;
  dishUseMap: ReadonlyMap<number, DishUse>;
  forgeProgress: ForgeProgress;
  forgeRecipeMap: ReadonlyMap<number, ForgeRecipe>;
  homeProgress: HomeProgress;
  instructionRecipeMap: ReadonlyMap<number, CookingRecipe>;
}
