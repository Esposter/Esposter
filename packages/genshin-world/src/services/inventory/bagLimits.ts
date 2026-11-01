// How many kinds of item the bag holds beside the weapons, artifacts and furnishings it counts on their own. The wiki's
// Inventory page gives up to 2,300 unique items, counted by kind and not by quantity
export const INVENTORY_KIND_LIMIT = 2300;
// The most of any one stack the save holds: the largest stack limit a published item has, 99,999 for Forging Ore
// And the EXP Enhancement Materials, which the items builder refuses an item past. Most items stack lower, at
// Their own limit of 9,999, which addInventoryItem clamps a pick up by, so this ceiling bounds only what the save holds
export const MAX_ITEM_QUANTITY = 99_999;
