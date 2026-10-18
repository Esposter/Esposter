import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";
import type { ShopReputationDiscount } from "#src/models/genshinAssets/shops/ShopReputationDiscount";

import { toShopGoodSlice } from "#src/services/genshinAssets/shops/toShopGoodSlice";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The goods of the table that pass the filter, one row a good by its id, as one record of the shops dataset by stem
// A Reputation discount, where the good's shop is one it names, is written onto each of its goods
export const buildShopGoodSlice = (
  checkIsIncluded: (row: ExcelShopGoodsRow) => boolean,
  stem: string,
  reputationDiscount?: ShopReputationDiscount,
): Record<string, unknown> => ({
  [`${GameDataset.Shops}/${stem}`]: toShopGoodSlice(
    readExcelTable<ExcelShopGoodsRow>("ShopGoodsExcelConfigData"),
    checkIsIncluded,
    reputationDiscount,
  ),
});
