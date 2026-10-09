import { ItemCategory } from "genshin-interface/save";

// The tabs the bag counts on their own, and how many pieces each holds, every weapon, artifact or furnishing one; the
// Rest share the bag's room by kind. The wiki's Inventory page sets each room: a maximum of 2,000 Weapons, 2,400
// Artifacts and 2,600 Furnishings held at a time
export const ItemCategoryRoomMap: Partial<Record<ItemCategory, number>> = {
  [ItemCategory.Artifact]: 2400,
  [ItemCategory.Furnishing]: 2600,
  [ItemCategory.Weapon]: 2000,
};
