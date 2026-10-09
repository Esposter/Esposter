import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CraftingRecipeKind } from "genshin-world";
import { join } from "node:path";

// The game's combine and material tables in the dump, read by their names
export const COMBINE_TABLE_NAME = "CombineExcelConfigData";
export const MATERIAL_TABLE_NAME = "MaterialExcelConfigData";
// The recipe type of a craft at the bench. The convert rows, which turn one boss material into another, and the
// Homeworld's rows are other kinds of recipe and are not written
export const COMBINE_RECIPE_TYPE = "RECIPE_TYPE_COMBINE";
// The use an instruction or a formula carries to open the recipe it names, its first parameter the recipe's combine id
export const UNLOCK_COMBINE_USE_OP = "ITEM_USE_UNLOCK_COMBINE";
// Three of a material make one of the next tier, so a tier's recipe takes exactly this many of one material
export const TIER_MATERIAL_COUNT = 3;
// Condensed Resin, the one recipe whose result is a crafted item of the resin's own kind
export const CONDENSED_RESIN_ITEM_ID = 220007;
// Condensed Resin takes one crystal core and this much Original Resin
export const CONDENSED_RESIN_CRYSTAL_CORE_ITEM_ID = 100085;
export const CONDENSED_RESIN_ORIGINAL_RESIN_COUNT = 60;
// The kind of recipe each combine type the bench crafts is written as. Combine type six holds Condensed Resin beside
// The resonance stones and Portable Waypoint, which no page places yet, so it is left out here
export const CombineTypeCraftingRecipeKindMap: Record<number, CraftingRecipeKind> = {
  1: CraftingRecipeKind.Tier,
  2: CraftingRecipeKind.Tier,
  3: CraftingRecipeKind.Tier,
  4: CraftingRecipeKind.Potion,
  5: CraftingRecipeKind.Tier,
  10: CraftingRecipeKind.Bait,
  12: CraftingRecipeKind.Potion,
};
// Where the recipe slice is written, in the world's generated folder it is imported on demand from
export const CRAFTING_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "crafting",
);
export const CRAFTING_RECIPES_PATH: string = join(CRAFTING_GENERATED_DIRECTORY, "recipes.json");
