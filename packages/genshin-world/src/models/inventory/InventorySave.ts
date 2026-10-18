import { inventoryItemSaveSchema } from "#src/models/inventory/InventoryItemSave";
import { QUICK_SWAP_GADGET_LIMIT } from "#src/services/gadget/constants";
import { MAX_INVENTORY_ITEM_COUNT } from "#src/services/save/constants";
import { z } from "zod";

// The bag as the save holds it: its entries, the id the next one it takes in is given, and the gadget equipped to the
// Quick-use slot by its item id when one is, and the gadgets the quick swap holds by their item ids. A bag saved before a
// Gadget could be equipped holds none, so it stays valid; the quick swap's slots are required, so a save holding none is refused
export const inventorySaveSchema = z.object({
  equippedGadgetItemId: z.int().positive().optional(),
  items: z.array(inventoryItemSaveSchema).max(MAX_INVENTORY_ITEM_COUNT),
  nextId: z.int().nonnegative(),
  quickSwapItemIds: z.array(z.int().positive()).max(QUICK_SWAP_GADGET_LIMIT),
});

export type InventorySave = z.infer<typeof inventorySaveSchema>;
