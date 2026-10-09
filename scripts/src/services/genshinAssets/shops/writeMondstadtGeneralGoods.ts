import { MONDSTADT_GENERAL_GOODS_SHOP_TYPE } from "#src/services/genshinAssets/shops/constants";
import { writeShopGoodSlice } from "#src/services/genshinAssets/shops/writeShopGoodSlice";

// The Mondstadt grocery's general goods, the Mora-priced goods of its shop, written as one slice in the World's generated folder
export const writeMondstadtGeneralGoods = (): void => {
  writeShopGoodSlice((row) => row.shopType === MONDSTADT_GENERAL_GOODS_SHOP_TYPE, "mondstadtGeneralGoods.json");
};
