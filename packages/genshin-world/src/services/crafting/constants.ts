// The item id a recipe names for Original Resin. It is a currency the wallet holds, regenerating, rather than a stack in
// The bag, so a recipe that names it is paid from the wallet
export const ORIGINAL_RESIN_ITEM_ID = 106;
// The item id Condensed Resin is crafted as, a stack in the bag rather than a wallet currency
export const CONDENSED_RESIN_ITEM_ID = 220_007;
// The combine types of the bench's tabs a crafting talent names: enhancement materials, weapon ascension materials, talent
// Materials, and the potions, which the table splits across two types
export const COMBINE_TYPE_ENHANCEMENT = 1;
export const COMBINE_TYPE_WEAPON_ASCENSION = 2;
export const COMBINE_TYPE_CHARACTER_TALENT_MATERIAL = 3;
export const COMBINE_TYPE_POTION: readonly number[] = [4, 12];
// The scene group holding Mondstadt's crafting bench, and the bench's NPC member in it: the birth the dump places as an NPC
// Of its own, invisible and named Craft, so the bench is its interaction and no person
export const MONDSTADT_CRAFTING_BENCH_GROUP_ID = 133_004_082;
export const MONDSTADT_CRAFTING_BENCH_NPC_ID = 10_256;
// The id of the bench's row in the prompts, which holds the one bench the world offers
export const CRAFTING_BENCH_INTERACTABLE_ID = "craftingBench";
