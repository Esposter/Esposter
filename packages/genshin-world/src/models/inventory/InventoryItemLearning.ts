import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryEntryUse } from "#src/models/inventory/InventoryEntryUse";

// What an item of the bag teaches when it is used, a dish, a recipe or a blueprint, as `getInventoryItemLearning` resolves it:
// Whether that is open already, and the bag and progress after the item teaches it, undefined where it is not held or is
// Open already
export interface InventoryItemLearning {
  isOpen: boolean;
  learn: (inventory: Inventory) => InventoryEntryUse | undefined;
}
