import { inventoryItemSaveSchema } from "#src/models/inventory/InventoryItemSave";
import { QUICK_SWAP_GADGET_LIMIT } from "#src/services/gadget/constants";
import { MAX_INVENTORY_ITEM_COUNT } from "#src/services/save/constants";
import { z } from "zod";

// The bag as the save holds it: its entries, the id the next one it takes in is given, the gadget equipped to the
// Quick-use slot by its item id, and the gadgets the quick swap holds by their item ids. The gadget is absent
// While none is equipped, since `equipGadget` sets it only for an equipable gadget; the quick swap's slots are
// Required, so a save holding none is refused
export const inventorySaveSchema = z.object({
  equippedGadgetItemId: z.int().positive().optional(),
  items: z.array(inventoryItemSaveSchema).max(MAX_INVENTORY_ITEM_COUNT),
  nextId: z.int().nonnegative(),
  quickSwapItemIds: z.array(z.int().positive()).max(QUICK_SWAP_GADGET_LIMIT),
});

export type InventorySave = z.infer<typeof inventorySaveSchema>;
