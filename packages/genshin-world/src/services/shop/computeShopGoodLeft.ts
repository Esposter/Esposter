import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";

// How many more of a good the player can buy before its limit is reached, its purchases counted from its refresh. Undefined
// Where the good has no buy limit, a limit of zero being no limit
export const computeShopGoodLeft = (
  good: ShopGood,
  purchases: ShopPurchase[],
  now: Temporal.Instant,
): number | undefined => {
  if (good.buyLimit === 0) return undefined;
  const refreshTime = computeShopRefreshTime(good.refresh, now);
  const boughtCount = purchases.filter(
    ({ goodsId, purchasedAt }) => goodsId === good.goodsId && Temporal.Instant.compare(purchasedAt, refreshTime) >= 0,
  ).length;
  return Math.max(good.buyLimit - boughtCount, 0);
};
