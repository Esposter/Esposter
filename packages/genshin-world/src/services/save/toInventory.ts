import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventorySave } from "#src/models/inventory/InventorySave";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

// The bag read from its save, each entry's definition read by the item's id from the game's tables, which name it in the
// Reader's language. The save never holds a name, so a bag loads in whatever language it is read in
export const toInventory = (
  { items, nextId }: InventorySave,
  getItemDefinition: (itemId: number) => ItemDefinition,
): Inventory => ({
  items: items.map(({ itemId, ...entry }) => ({ ...entry, definition: getItemDefinition(itemId) })),
  nextId,
});
