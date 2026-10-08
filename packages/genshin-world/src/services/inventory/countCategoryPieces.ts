import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemCategory } from "genshin-interface";

// How many pieces of a tab the bag holds, each weapon or artifact one and a stack its count
export const countCategoryPieces = (items: InventoryItem[], category: ItemCategory): number =>
  items.filter((item) => item.definition.category === category).reduce((total, item) => total + item.quantity, 0);
