import type { InventoryItem } from "#src/models/inventory/InventoryItem";

// The bag: its entries, and the id the next one it takes in is given
export interface Inventory {
  items: InventoryItem[];
  nextId: number;
}
