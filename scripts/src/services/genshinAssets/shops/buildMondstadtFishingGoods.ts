import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import { MONDSTADT_FISHING_SHOP_TYPE } from "#src/services/genshinAssets/shops/constants";
import { getShopGoodPrice } from "#src/services/genshinAssets/shops/getShopGoodPrice";

// The Mondstadt Fishing Association's goods, one record of the shops dataset, each bought with fish from the bag. The Windtangler
// Costs one of four fish counts, which no single price holds, so it is left out
export const buildMondstadtFishingGoods = (): Record<string, unknown> =>
  buildShopGoodSlice(
    (row) => row.shopType === MONDSTADT_FISHING_SHOP_TYPE && getShopGoodPrice(row) !== undefined,
    "mondstadtFishing",
  );
