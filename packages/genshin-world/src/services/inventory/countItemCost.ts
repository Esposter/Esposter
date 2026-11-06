import type { ItemCount } from "#src/models/inventory/ItemCount";

// How many of one item a set of item counts comes to in all, summed over every count of the set that names it
export const countItemCost = (itemCounts: readonly ItemCount[], itemId: number): number =>
  itemCounts.reduce((total, itemCount) => (itemCount.id === itemId ? total + itemCount.count : total), 0);
