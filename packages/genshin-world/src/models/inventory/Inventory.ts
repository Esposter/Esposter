import type { InventoryItem } from "#src/models/inventory/InventoryItem";

// The bag: its entries, the id the next one it takes in is given, and the gadget equipped to the quick-use slot by its
// Item id, when one is, and the gadgets the quick swap holds by their item ids
export interface Inventory {
  equippedGadgetItemId?: number;
  items: InventoryItem[];
  nextId: number;
  quickSwapItemIds: number[];
}
