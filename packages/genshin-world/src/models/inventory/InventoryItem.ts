import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

// One entry of the bag: a stack of an item, or a single weapon or artifact with its level. A weapon's entry also holds its
// Ascension, the EXP it holds towards the next level and its refinement rank, which a stack or an artifact never has. Its
// Id is the bag's own count of the entries it has taken in, so it never repeats and runs in the order they were obtained
export interface InventoryItem {
  ascension?: number;
  definition: ItemDefinition;
  experience?: number;
  id: number;
  level?: number;
  quantity: number;
  refinement?: number;
}
