import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { FISHING_ASSOCIATION_SHOPS } from "#src/services/genshinAssets/shops/constants";
import { getShopGoodPrice } from "#src/services/genshinAssets/shops/getShopGoodPrice";

// Whether a good of the table is one a Fishing Association sells for fish: a good of one of their shops that a single item
// Prices. A good priced in several fish, as the Windtangler is, has no single price to be bought with, so it is left out
export const checkIsFishingAssociationGood = (row: ExcelShopGoodsRow): boolean =>
  FISHING_ASSOCIATION_SHOPS.some(({ shopType }) => shopType === row.shopType) && getShopGoodPrice(row) !== undefined;
