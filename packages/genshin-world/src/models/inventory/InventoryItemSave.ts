import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { MAX_ITEM_QUANTITY } from "#src/services/inventory/bagLimits";
import { MAX_WEAPON_REFINEMENT } from "#src/services/weapon/constants";
import { z } from "zod";

// One entry of the bag as the save holds it, by its kind: a stack by its count, an artifact by its level, and a weapon by
// Its level, the EXP it holds towards the next, its ascension and its refinement. Each is the item's id in the game's
// Tables, and its name and tab are read back from them in the reader's language, never saved. A stack holds no more than
// The most any item can be held at
const inventoryItemSaveBaseSchema = z.object({ id: z.int().nonnegative(), itemId: z.int().positive() });
export const inventoryItemSaveSchema = z.discriminatedUnion("kind", [
  inventoryItemSaveBaseSchema.extend({
    kind: z.literal(InventoryItemKind.Artifact),
    level: z.int().nonnegative(),
    quantity: z.literal(1),
  }),
  inventoryItemSaveBaseSchema.extend({
    kind: z.literal(InventoryItemKind.Stack),
    quantity: z.int().positive().max(MAX_ITEM_QUANTITY),
  }),
  inventoryItemSaveBaseSchema.extend({
    ascension: z.int().nonnegative(),
    experience: z.int().nonnegative(),
    kind: z.literal(InventoryItemKind.Weapon),
    level: z.int().positive(),
    quantity: z.literal(1),
    refinement: z.int().min(1).max(MAX_WEAPON_REFINEMENT),
  }),
]);

export type InventoryItemSave = z.infer<typeof inventoryItemSaveSchema>;
