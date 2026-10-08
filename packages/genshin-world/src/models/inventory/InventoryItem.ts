import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

// One entry of the bag: a stack of an item, or a single weapon or artifact with its level. Its id is the bag's own count
// Of the entries it has taken in, so it never repeats and runs in the order they were obtained
export interface InventoryItem {
  definition: ItemDefinition;
  id: number;
  level?: number;
  quantity: number;
}
