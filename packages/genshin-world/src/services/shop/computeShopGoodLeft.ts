import type { ShopGoodLimit } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { computeShopGoodBought } from "#src/services/shop/computeShopGoodBought";

// How many more of a good the player can buy before its limit is reached, its purchases counted from its refresh. Undefined
// Where the good has no buy limit, a limit of zero being no limit
export const computeShopGoodLeft = (
  good: ShopGoodLimit,
  purchases: ShopPurchase[],
  now: Temporal.Instant,
): number | undefined => {
  if (good.buyLimit === 0) return undefined;
  return Math.max(good.buyLimit - computeShopGoodBought(good, purchases, now), 0);
};
