import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { computeMonthlyRefreshTime } from "#src/services/shop/computeMonthlyRefreshTime";

// Whether a good of the slice has no buys left: its limit reached by the purchases made since this month's refresh came
// Round. A buy limit of zero is no limit, so such a good is never sold out
export const checkIsShopGoodSoldOut = (good: ShopGood, purchases: ShopPurchase[], now: Temporal.Instant): boolean => {
  if (good.buyLimit === 0) return false;
  const refreshTime = computeMonthlyRefreshTime(now);
  const boughtCount = purchases.filter(
    ({ goodsId, purchasedAt }) => goodsId === good.goodsId && Temporal.Instant.compare(purchasedAt, refreshTime) >= 0,
  ).length;
  return boughtCount >= good.buyLimit;
};
