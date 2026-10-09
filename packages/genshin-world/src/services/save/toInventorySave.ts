import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventorySave } from "#src/models/inventory/InventorySave";

// The bag as its save holds it: each entry by the item's id, its definition's name and tab left to the game's tables
export const toInventorySave = ({ items, nextId }: Inventory): InventorySave => ({
  items: items.map(({ definition, ...entry }) => ({ ...entry, itemId: definition.id })),
  nextId,
});
