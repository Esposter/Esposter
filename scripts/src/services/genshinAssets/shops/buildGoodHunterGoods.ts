import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import { GOOD_HUNTER_SHOP_TYPE, MONDSTADT_CITY_ID } from "#src/services/genshinAssets/shops/constants";
import { readCityDiscountLevel } from "#src/services/genshinAssets/shops/readCityDiscountLevel";

// The Good Hunter's goods, the food, cooking ingredients and recipes Sara sells, as one record of the shops dataset. Its
// Shop takes the discount of its city, Mondstadt, at the level the city's shops give, as the grocery does
export const buildGoodHunterGoods = (): Record<string, unknown> =>
  buildShopGoodSlice(
    (row) => row.shopType === GOOD_HUNTER_SHOP_TYPE,
    "goodHunter",
    readCityDiscountLevel(MONDSTADT_CITY_ID),
  );
