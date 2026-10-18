import type { ShopGood } from "#src/models/shop/ShopGood";

import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { computeReputationDiscountedPrice } from "#src/services/reputation/computeReputationDiscountedPrice";

// The good as a player at this Reputation level pays for it. A good priced in Mora whose discount level the level reaches
// Is priced at the discounted Mora, and every other good keeps its price
export const discountShopGood = (good: ShopGood, reputationLevel: number): ShopGood => {
  const isDiscounted =
    good.priceItemId === MORA_ITEM_ID &&
    good.reputationDiscountLevel !== undefined &&
    reputationLevel >= good.reputationDiscountLevel;
  return isDiscounted ? { ...good, priceCount: computeReputationDiscountedPrice(good.priceCount) } : good;
};
