import { inventoryItemSaveSchema } from "#src/models/inventory/InventoryItemSave";
import { MAX_INVENTORY_ITEM_COUNT } from "#src/services/save/constants";
import { z } from "zod";

// The bag as the save holds it: its entries, and the id the next one it takes in is given
export const inventorySaveSchema = z.object({
  items: z.array(inventoryItemSaveSchema).max(MAX_INVENTORY_ITEM_COUNT),
  nextId: z.int().nonnegative(),
});

export type InventorySave = z.infer<typeof inventorySaveSchema>;
