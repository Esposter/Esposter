import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import { MONDSTADT_VENDOR_SHOPS } from "#src/services/genshinAssets/shops/constants";

// The Mondstadt vendors' goods, one record of the shops dataset for each vendor's shop, each named by its vendor
export const buildMondstadtVendorGoods = (): Record<string, unknown> =>
  Object.assign(
    {},
    ...MONDSTADT_VENDOR_SHOPS.map(({ shopType, stem }) => buildShopGoodSlice((row) => row.shopType === shopType, stem)),
  );
