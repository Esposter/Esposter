import { CraftingRecipeKind } from "genshin-world";

// The game's combine and material tables in the dump, read by their names
export const COMBINE_TABLE_NAME = "CombineExcelConfigData";
// The recipe type of a craft at the bench. The convert rows, which turn one boss material into another, and the
// Homeworld's rows are other kinds of recipe and are not kept
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
// The kind of recipe each combine type the bench crafts is recorded as. Combine type six holds Condensed Resin beside the
// Resonance Stones and Portable Waypoint; a row makes Condensed Resin by its result, so the rest of that type are gadgets
export const CombineTypeCraftingRecipeKindMap: Record<number, CraftingRecipeKind> = {
  1: CraftingRecipeKind.Tier,
  2: CraftingRecipeKind.Tier,
  3: CraftingRecipeKind.Tier,
  4: CraftingRecipeKind.Potion,
  5: CraftingRecipeKind.Tier,
  6: CraftingRecipeKind.Gadget,
  10: CraftingRecipeKind.Bait,
  12: CraftingRecipeKind.Potion,
};
// The scene group holding Mondstadt's crafting bench, and the bench's NPC member in it: the birth the dump places as an NPC
// Of its own, invisible and named Craft, so the bench is its interaction and no person
export const MONDSTADT_CRAFTING_BENCH_GROUP_ID = 133_004_082;
export const MONDSTADT_CRAFTING_BENCH_NPC_ID = 10_256;
// The keeper Timaeus, who stands beside Mondstadt's bench. The scene group record holds no birth of his, so his place is
// The bench's, moved along the game's x axis by the distance below: the wiki gives him beside the bench but no distance,
// So both the distance and the place it gives are provisional until a recording confirms them
export const MONDSTADT_CRAFTING_KEEPER_NPC_ID = 9706;
export const CRAFTING_KEEPER_BENCH_OFFSET_METRES = 2;
