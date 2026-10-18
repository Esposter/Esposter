import type { ShopGood } from "#src/models/shop/ShopGood";

import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { computeReputationDiscountedPrice } from "#src/services/reputation/computeReputationDiscountedPrice";

// The good as a player at this Reputation level pays for it. A good whose discount level the level reaches pays the discounted
// Price for its Mora cost, and every other cost keeps its count
export const discountShopGood = (good: ShopGood, reputationLevel: number): ShopGood => {
  const isDiscounted = good.reputationDiscountLevel !== undefined && reputationLevel >= good.reputationDiscountLevel;
  return isDiscounted
    ? {
        ...good,
        costs: good.costs.map((cost) =>
          cost.itemId === MORA_ITEM_ID ? { ...cost, count: computeReputationDiscountedPrice(cost.count) } : cost,
        ),
      }
    : good;
};
