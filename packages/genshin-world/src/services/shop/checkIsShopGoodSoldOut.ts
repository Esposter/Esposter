import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { computeShopGoodLeft } from "#src/services/shop/computeShopGoodLeft";

// Whether a good of the slice has no buys left: its limit reached by the purchases made since its refresh came round. A
// Buy limit of zero is no limit, so such a good is never sold out
export const checkIsShopGoodSoldOut = (good: ShopGood, purchases: ShopPurchase[], now: Temporal.Instant): boolean =>
  computeShopGoodLeft(good, purchases, now) === 0;
