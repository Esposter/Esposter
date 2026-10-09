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
