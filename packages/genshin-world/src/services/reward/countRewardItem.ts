import type { ItemCount } from "#src/models/inventory/ItemCount";

// The count one item a reward list gives, summed over its entries
export const countRewardItem = (items: readonly ItemCount[], id: number): number =>
  items.reduce((count, item) => (item.id === id ? count + item.count : count), 0);
