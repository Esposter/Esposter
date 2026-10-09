import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { checkIsShopGoodSoldOut } from "#src/services/shop/checkIsShopGoodSoldOut";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";

// The wallet and purchases after one of a good is bought at `now` by a player of this Adventure Rank, its price taken and
// Its item's currency given. Undefined where the good is not offered: below its rank, outside its dates, sold out this
// Month, or unaffordable, or where its price or item is no currency this rule trades in
export const buyShopGood = (
  wallet: Wallet,
  purchases: ShopPurchase[],
  good: ShopGood,
  adventureRank: number,
  now: Temporal.Instant,
): undefined | { purchases: ShopPurchase[]; wallet: Wallet } => {
  const priceCurrency = ShopItemCurrencyMap[good.priceItemId];
  const itemCurrency = ShopItemCurrencyMap[good.itemId];
  const isInSalePeriod =
    Temporal.Instant.compare(Temporal.Instant.from(good.beginTime), now) <= 0 &&
    Temporal.Instant.compare(now, Temporal.Instant.from(good.endTime)) < 0;
  if (
    priceCurrency === undefined ||
    itemCurrency === undefined ||
    adventureRank < good.minPlayerLevel ||
    !isInSalePeriod ||
    checkIsShopGoodSoldOut(good, purchases, now) ||
    wallet[priceCurrency] < good.priceCount
  )
    return undefined;
  return {
    purchases: [...purchases, { goodsId: good.goodsId, purchasedAt: now }],
    wallet: {
      ...wallet,
      [itemCurrency]: wallet[itemCurrency] + good.itemCount,
      [priceCurrency]: wallet[priceCurrency] - good.priceCount,
    },
  };
};
