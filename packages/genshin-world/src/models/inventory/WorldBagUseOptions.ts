import type { DishUse } from "#src/models/cooking/DishUse";
import type { CraftingProgress } from "#src/models/crafting/CraftingProgress";
import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";
import type { ForgeProgress } from "#src/models/forging/ForgeProgress";
import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";
import type { HomeBlueprint } from "#src/models/home/HomeBlueprint";
import type { HomeProgress } from "#src/models/home/HomeProgress";
import type { KitContext } from "#src/models/kit/KitContext";
import type { Ref } from "vue";

// What using a bag entry reads and writes beside the bag, the wallet and the cooking the stores hold: the dishes its entry is
// Read as, the kit's effects a dish or a food acts on, and the recipes and blueprints its diagram or instruction opens, with
// The progress each is learned in
export interface WorldBagUseOptions {
  blueprintMap: Readonly<Ref<ReadonlyMap<number, HomeBlueprint>>>;
  craftingProgress: Ref<CraftingProgress>;
  craftingRecipeMap: Readonly<Ref<ReadonlyMap<number, CraftingRecipe>>>;
  dishUseMap: Readonly<Ref<ReadonlyMap<number, DishUse>>>;
  forgeProgress: Ref<ForgeProgress>;
  forgeRecipeMap: Readonly<Ref<ReadonlyMap<number, ForgeRecipe>>>;
  getMemberMaxHealth: (characterId: number) => number | undefined;
  homeProgress: Ref<HomeProgress>;
  kitContext: KitContext;
}
