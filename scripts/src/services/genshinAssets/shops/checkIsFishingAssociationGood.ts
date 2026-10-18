import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { FISHING_ASSOCIATION_SHOPS } from "#src/services/genshinAssets/shops/constants";
import { getShopGoodCosts } from "#src/services/genshinAssets/shops/getShopGoodCosts";

// Whether a good of the table is one a Fishing Association sells for fish: a good of one of their shops that a cost prices.
// A good priced in several fish, as the Windtangler is, keeps every one of its costs
export const checkIsFishingAssociationGood = (row: ExcelShopGoodsRow): boolean =>
  FISHING_ASSOCIATION_SHOPS.some(({ shopType }) => shopType === row.shopType) && getShopGoodCosts(row).length > 0;
