import { takeOne } from "@esposter/shared";

// The item a draw of a list picks, one of its entries at random
export const pickItemId = (itemIds: number[], random: () => number): number =>
  takeOne(itemIds, Math.floor(random() * itemIds.length));
