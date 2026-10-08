import { ItemCategory } from "genshin-interface";

// The tabs the bag counts on their own, and how many pieces each holds, every weapon, artifact or furnishing one; the
// Rest share the bag's room by kind
export const ItemCategoryRoomMap: Partial<Record<ItemCategory, number>> = {
  [ItemCategory.Artifact]: 2400,
  [ItemCategory.Furnishing]: 2600,
  [ItemCategory.Weapon]: 2000,
};
