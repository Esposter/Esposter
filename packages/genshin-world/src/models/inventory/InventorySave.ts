import { inventoryItemSaveSchema } from "#src/models/inventory/InventoryItemSave";
import { MAX_INVENTORY_ITEM_COUNT } from "#src/services/save/constants";
import { z } from "zod";

// The bag as the save holds it: its entries, the id the next one it takes in is given, and the gadget equipped to the
// Quick-use slot by its item id when one is. A bag saved before a gadget could be equipped holds none, so it stays valid
export const inventorySaveSchema = z.object({
  equippedGadgetItemId: z.int().positive().optional(),
  items: z.array(inventoryItemSaveSchema).max(MAX_INVENTORY_ITEM_COUNT),
  nextId: z.int().nonnegative(),
});

export type InventorySave = z.infer<typeof inventorySaveSchema>;
