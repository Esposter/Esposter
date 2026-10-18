import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { toShopGoodRow } from "#src/services/genshinAssets/shops/toShopGoodRow";
import { SHOP_GOODS_TABLE_NAME } from "#src/services/genshinText/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The goods of the table that pass the filter, one row a good by its id, as one record of the shops dataset named by its stem.
// A reputation discount level, where the good's shop gives one, is written onto each of its goods
export const buildShopGoodSlice = (
  checkIsIncluded: (row: ExcelShopGoodsRow) => boolean,
  stem: string,
  reputationDiscountLevel?: number,
): Record<string, unknown> => {
  const goods = readExcelTable<ExcelShopGoodsRow>(SHOP_GOODS_TABLE_NAME)
    .filter((row) => checkIsIncluded(row))
    .map((row) => toShopGoodRow(row, reputationDiscountLevel))
    .toSorted((firstGood, secondGood) => firstGood.goodsId - secondGood.goodsId);
  return { [`${GameDataset.Shops}/${stem}`]: goods };
};
