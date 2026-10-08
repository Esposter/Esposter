import { ItemCategory } from "genshin-interface";

// The tabs whose every weapon or artifact is an entry of its own, never stacked, sorted by level or quality as chosen
export const EQUIPMENT_CATEGORIES: readonly ItemCategory[] = [ItemCategory.Weapon, ItemCategory.Artifact];
// The tabs the game sorts from the highest quality down
export const QUALITY_SORTED_CATEGORIES: readonly ItemCategory[] = [ItemCategory.Gadget, ItemCategory.Quest];
// How many kinds of item the bag holds beside the weapons, artifacts and furnishings it counts on their own
export const INVENTORY_KIND_LIMIT = 2300;
// A new weapon is at level 1 and a new artifact at 0
export const WEAPON_START_LEVEL = 1;
export const ARTIFACT_START_LEVEL = 0;
