import { takeRandom } from "@esposter/shared";

// The item a draw of a list picks, one of its entries at random
export const pickItemId = (itemIds: number[], random: () => number): number => takeRandom(itemIds, random);
