import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";

// How many of a good the player has bought in its current refresh window at `now`: the count of its purchase when the
// Latest of them falls on or after the window's start, and none once the good has come back since
export const computeShopGoodBought = (good: ShopGood, purchases: ShopPurchase[], now: Temporal.Instant): number => {
  const goodPurchase = purchases.find(({ goodsId }) => goodsId === good.goodsId);
  if (!goodPurchase) return 0;
  const refreshTime = computeShopRefreshTime(good.refresh, now);
  return Temporal.Instant.compare(goodPurchase.lastPurchasedAt, refreshTime) >= 0 ? goodPurchase.count : 0;
};
