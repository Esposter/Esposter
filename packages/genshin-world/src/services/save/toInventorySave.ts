import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { InventoryItemSave } from "#src/models/inventory/InventoryItemSave";
import type { InventorySave } from "#src/models/inventory/InventorySave";

import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { ItemCategory } from "genshin-interface";

// An entry of the bag as its save holds it, by the item's id and its kind: a weapon with its state, an artifact with the
// Artifact it was rolled as, and a stack with its count. Its name and tab are left to the game's tables
const toInventoryItemSave = ({ definition, ...entry }: InventoryItem): InventoryItemSave => {
  const { id, quantity } = entry;
  const itemId = definition.id;
  if (definition.category === ItemCategory.Weapon) {
    const { ascension, experience, level, refinement } = entry;
    if (ascension === undefined || experience === undefined || level === undefined || refinement === undefined)
      throw new InvalidOperationError(Operation.Read, toInventorySave.name, `weapon ${id} without its state`);
    return { ascension, experience, id, itemId, kind: InventoryItemKind.Weapon, level, quantity: 1, refinement };
  }
  if (definition.category === ItemCategory.Artifact) {
    const { artifact } = entry;
    if (artifact === undefined)
      throw new InvalidOperationError(Operation.Read, toInventorySave.name, `artifact ${id} without its artifact`);
    return { artifact, id, itemId, kind: InventoryItemKind.Artifact, quantity: 1 };
  }
  return { id, itemId, kind: InventoryItemKind.Stack, quantity };
};

// The bag as its save holds it: each entry by the item's id and its kind, its definition's name and tab left to the game's
// Tables
export const toInventorySave = ({ items, ...inventory }: Inventory): InventorySave => ({
  ...inventory,
  items: items.map((item) => toInventoryItemSave(item)),
});
