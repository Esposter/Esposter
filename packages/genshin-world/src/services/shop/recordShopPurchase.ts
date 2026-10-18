import type { ShopGoodLimit } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { computeShopGoodBought } from "#src/services/shop/computeShopGoodBought";

// The purchases once a good is bought at `now`: its entry counts the purchase on top of those in the same refresh window,
// And starts again at one once the good has come back. A good with no limit keeps no entry, since no limit counts it, so
// The list holds one entry for each limited good the player has bought
export const recordShopPurchase = (
  purchases: ShopPurchase[],
  good: ShopGoodLimit,
  now: Temporal.Instant,
): ShopPurchase[] => {
  if (good.buyLimit === 0) return purchases;
  const count = computeShopGoodBought(good, purchases, now) + 1;
  return [
    ...purchases.filter(({ goodsId }) => goodsId !== good.goodsId),
    { count, goodsId: good.goodsId, lastPurchasedAt: now },
  ];
};
