import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import { checkIsFishingAssociationGood } from "#src/services/genshinAssets/shops/checkIsFishingAssociationGood";
import { FISHING_ASSOCIATION_SHOPS } from "#src/services/genshinAssets/shops/constants";

// The Fishing Associations' goods, one record of the shops dataset for each region's shop, each bought with fish from the
// Bag. A good priced in several fish, which no single price holds, is left out
export const buildFishingAssociationGoods = (): Record<string, unknown> =>
  Object.assign(
    {},
    ...FISHING_ASSOCIATION_SHOPS.map(({ shopType, stem }) =>
      buildShopGoodSlice((row) => row.shopType === shopType && checkIsFishingAssociationGood(row), stem),
    ),
  );
