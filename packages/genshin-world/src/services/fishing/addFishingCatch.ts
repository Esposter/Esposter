import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryAddition } from "#src/models/inventory/InventoryAddition";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";

// The bag after a catch: each item its reward gives is taken in as a pick up takes it, and the items' overflow is
// Summed. The caller resolves each item's definition, since a catch names its items by id
export const addFishingCatch = (
  inventory: Inventory,
  rewardItems: { definition: ItemDefinition; itemCount: number }[],
): InventoryAddition =>
  rewardItems.reduce<InventoryAddition>(
    (addition, { definition, itemCount }) => {
      const taken = addInventoryItem(addition.inventory, definition, itemCount);
      return { inventory: taken.inventory, overflow: addition.overflow + taken.overflow };
    },
    { inventory, overflow: 0 },
  );
