import type { InventoryItem } from "#src/models/inventory/InventoryItem";

// How many of one item the bag holds across all its stacks
export const countInventoryItem = (items: InventoryItem[], itemId: number): number =>
  items.reduce((total, item) => (item.definition.id === itemId ? total + item.quantity : total), 0);
