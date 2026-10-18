import type { Currency } from "#src/models/inventory/Currency";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood, ShopGoodLimit } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { checkIsShopGoodSoldOut } from "#src/services/shop/checkIsShopGoodSoldOut";
import { recordShopPurchase } from "#src/services/shop/recordShopPurchase";

// The wallet and purchases after a good's price is paid at `now`: the price taken out of the currency it is paid in, and the
// Purchase of the good recorded. Undefined where the good is sold out this refresh or the wallet cannot pay the price
export const payShopGood = (
  wallet: Wallet,
  purchases: ShopPurchase[],
  good: Pick<ShopGood, "priceCount"> & ShopGoodLimit,
  priceCurrency: Currency,
  now: Temporal.Instant,
): undefined | { purchases: ShopPurchase[]; wallet: Wallet } => {
  if (checkIsShopGoodSoldOut(good, purchases, now) || wallet[priceCurrency] < good.priceCount) return undefined;
  return {
    purchases: recordShopPurchase(purchases, good, now),
    wallet: { ...wallet, [priceCurrency]: wallet[priceCurrency] - good.priceCount },
  };
};
