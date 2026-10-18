import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import { MONDSTADT_CITY_ID, MONDSTADT_GENERAL_GOODS_SHOP_TYPE } from "#src/services/genshinAssets/shops/constants";
import { readCityDiscountLevel } from "#src/services/genshinAssets/shops/readCityDiscountLevel";

// The Mondstadt grocery's general goods, the Mora-priced goods of its shop, as one record of the shops dataset. Shop 1004
// Takes the discount of its city, Mondstadt, at the level the city's shops give
export const buildMondstadtGeneralGoods = (): Record<string, unknown> =>
  buildShopGoodSlice(
    (row) => row.shopType === MONDSTADT_GENERAL_GOODS_SHOP_TYPE,
    "mondstadtGeneralGoods",
    readCityDiscountLevel(MONDSTADT_CITY_ID),
  );
