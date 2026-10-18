import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { MORA_ITEM_ID } from "#src/services/genshinAssets/shops/constants";

// The costs a good is bought with, each its item and how many: its Mora cost where the table gives one, and each priced item
// Slot of the table, a slot with no item or no count taking none
export const getShopGoodCosts = (row: ExcelShopGoodsRow): { count: number; itemId: number }[] => [
  ...(row.costScoin > 0 ? [{ count: row.costScoin, itemId: MORA_ITEM_ID }] : []),
  ...row.costItems.flatMap(({ count = 0, id = 0 }) => (count > 0 && id > 0 ? [{ count, itemId: id }] : [])),
];
