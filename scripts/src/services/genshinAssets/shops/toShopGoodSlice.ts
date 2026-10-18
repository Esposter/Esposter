import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";
import type { ShopReputationDiscount } from "#src/models/genshinAssets/shops/ShopReputationDiscount";
import type { ShopGoodRow } from "#src/models/genshinAssets/shops/ShopGoodRow";

import { toShopGoodRow } from "#src/services/genshinAssets/shops/toShopGoodRow";

// The goods of the rows that pass the filter, one row a good by its id. A good takes the discount's level only
// Where its shop is one the discount names, so a discount applies at its named shops and at no other
export const toShopGoodSlice = (
  rows: readonly ExcelShopGoodsRow[],
  checkIsIncluded: (row: ExcelShopGoodsRow) => boolean,
  reputationDiscount?: ShopReputationDiscount,
): ShopGoodRow[] =>
  rows
    .filter((row) => checkIsIncluded(row))
    .map((row) =>
      toShopGoodRow(row, reputationDiscount?.shopTypes.includes(row.shopType) ? reputationDiscount.level : undefined),
    )
    .toSorted((firstGood, secondGood) => firstGood.goodsId - secondGood.goodsId);
