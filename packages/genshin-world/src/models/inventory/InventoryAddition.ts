import type { Inventory } from "#src/models/inventory/Inventory";

// The bag after taking an item in, and how many of it there was no room for, which stay where they lay
export interface InventoryAddition {
  inventory: Inventory;
  overflow: number;
}
