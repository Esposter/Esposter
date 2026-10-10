import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { SHOP_GENERATED_DIRECTORY } from "#src/services/genshinAssets/shops/constants";
import { toShopGoodRow } from "#src/services/genshinAssets/shops/toShopGoodRow";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// The goods of the table that pass the filter, one row a good by its id, written as one slice in the World's generated folder
export const writeShopGoodSlice = (checkIsIncluded: (row: ExcelShopGoodsRow) => boolean, fileName: string): void => {
  const goods = readExcelTable<ExcelShopGoodsRow>("ShopGoodsExcelConfigData")
    .filter((row) => checkIsIncluded(row))
    .map((row) => toShopGoodRow(row))
    .toSorted((firstGood, secondGood) => firstGood.goodsId - secondGood.goodsId);
  mkdirSync(SHOP_GENERATED_DIRECTORY, { recursive: true });
  writeJsonFile(join(SHOP_GENERATED_DIRECTORY, fileName), goods);
};
