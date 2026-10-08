import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { checkIsPaimonsBargainsFateGood } from "#src/services/genshinAssets/shops/checkIsPaimonsBargainsFateGood";
import { PAIMON_BARGAINS_GOODS_PATH, SHOP_GENERATED_DIRECTORY } from "#src/services/genshinAssets/shops/constants";
import { toShopGoodRow } from "#src/services/genshinAssets/shops/toShopGoodRow";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { mkdirSync, writeFileSync } from "node:fs";

// Paimon's Bargains' Fates bought with Masterless Starglitter or Stardust, one row a good by its id, written as one slice
// In the World's generated folder
export const writePaimonsBargainsGoods = (): void => {
  const goods = readExcelTable<ExcelShopGoodsRow>("ShopGoodsExcelConfigData")
    .filter((row) => checkIsPaimonsBargainsFateGood(row))
    .map((row) => toShopGoodRow(row))
    .toSorted((firstGood, secondGood) => firstGood.goodsId - secondGood.goodsId);
  mkdirSync(SHOP_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(PAIMON_BARGAINS_GOODS_PATH, `${JSON.stringify(goods, undefined, 2)}\n`);
};
