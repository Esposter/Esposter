import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import { MONDSTADT_GENERAL_GOODS_SHOP_TYPE } from "#src/services/genshinAssets/shops/constants";

// The Mondstadt grocery's general goods, the Mora-priced goods of its shop, as one record of the shops dataset
export const buildMondstadtGeneralGoods = (): Record<string, unknown> =>
  buildShopGoodSlice((row) => row.shopType === MONDSTADT_GENERAL_GOODS_SHOP_TYPE, "mondstadtGeneralGoods");
