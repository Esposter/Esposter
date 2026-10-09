import { MAX_ITEM_QUANTITY } from "#src/services/inventory/bagLimits";
import { z } from "zod";

// One entry of the bag as the save holds it: its id in the bag, the item's id in the game's tables, and a weapon's or an
// Artifact's level. Its name and tab are read back from the game's tables in the reader's language, never saved. A
// Stack holds no more than the most any item can be held at
export const inventoryItemSaveSchema = z.object({
  id: z.int().nonnegative(),
  itemId: z.int().positive(),
  level: z.int().nonnegative().optional(),
  quantity: z.int().positive().max(MAX_ITEM_QUANTITY),
});

export type InventoryItemSave = z.infer<typeof inventoryItemSaveSchema>;
