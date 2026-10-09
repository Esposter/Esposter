import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";

// Whether a good of the slice has no buys left: its limit reached by the purchases made since its refresh came round. A
// Buy limit of zero is no limit, so such a good is never sold out
export const checkIsShopGoodSoldOut = (good: ShopGood, purchases: ShopPurchase[], now: Temporal.Instant): boolean => {
  if (good.buyLimit === 0) return false;
  const refreshTime = computeShopRefreshTime(good.refresh, now);
  const boughtCount = purchases.filter(
    ({ goodsId, purchasedAt }) => goodsId === good.goodsId && Temporal.Instant.compare(purchasedAt, refreshTime) >= 0,
  ).length;
  return boughtCount >= good.buyLimit;
};
