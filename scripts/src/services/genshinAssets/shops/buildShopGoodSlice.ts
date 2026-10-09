import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { toShopGoodRow } from "#src/services/genshinAssets/shops/toShopGoodRow";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameDataset } from "genshin-world";

// The goods of the table that pass the filter, one row a good by its id, as one record of the shops dataset named by its stem
export const buildShopGoodSlice = (
  checkIsIncluded: (row: ExcelShopGoodsRow) => boolean,
  stem: string,
): Record<string, unknown> => {
  const goods = readExcelTable<ExcelShopGoodsRow>("ShopGoodsExcelConfigData")
    .filter((row) => checkIsIncluded(row))
    .map((row) => toShopGoodRow(row))
    .toSorted((firstGood, secondGood) => firstGood.goodsId - secondGood.goodsId);
  return { [`${GameDataset.Shops}/${stem}`]: goods };
};
