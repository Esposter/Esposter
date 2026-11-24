import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryEntryUse } from "#src/models/inventory/InventoryEntryUse";

// What an item of the bag teaches when it is used, a dish, a recipe or a blueprint, as `getInventoryItemLearning`
// Resolves it: whether that is open already, and the bag and progress after the item teaches it, undefined where it is
// Not held or is open already
export interface InventoryItemLearning {
  isOpen: boolean;
  learn: (inventory: Inventory) => InventoryEntryUse | undefined;
}
