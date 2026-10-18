import type { Artifact } from "#src/models/artifact/Artifact";

import { artifactSchema } from "#src/models/artifact/Artifact";
import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { MAX_ITEM_QUANTITY } from "#src/services/inventory/bagLimits";
import { MAX_WEAPON_REFINEMENT } from "#src/services/weapon/constants";
import { z } from "zod";

export type InventoryItemSave = ArtifactInventoryItemSave | StackInventoryItemSave | WeaponInventoryItemSave;
// One entry of the bag as the save holds it, by its kind: a stack by its count, an artifact by the artifact rolled as it
// Dropped, and a weapon by its level, the EXP it holds towards the next, its ascension and its refinement. Each is the
// Item's id in the game's tables, and its name and tab are read back from them in the reader's language, never saved. A
// Stack holds no more than the most any item can be held at
interface ArtifactInventoryItemSave {
  artifact: Artifact;
  id: number;
  itemId: number;
  kind: InventoryItemKind.Artifact;
  quantity: 1;
}
interface StackInventoryItemSave {
  id: number;
  itemId: number;
  kind: InventoryItemKind.Stack;
  quantity: number;
}
interface WeaponInventoryItemSave {
  ascension: number;
  experience: number;
  id: number;
  itemId: number;
  kind: InventoryItemKind.Weapon;
  level: number;
  quantity: 1;
  refinement: number;
}

const inventoryItemSaveBaseSchema = z.object({ id: z.int().nonnegative(), itemId: z.int().positive() });
export const inventoryItemSaveSchema = z.discriminatedUnion("kind", [
  inventoryItemSaveBaseSchema.extend({
    artifact: artifactSchema,
    kind: z.literal(InventoryItemKind.Artifact),
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
]) satisfies z.ZodType<InventoryItemSave>;
