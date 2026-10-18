import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { checkIsShopGoodSoldOut } from "#src/services/shop/checkIsShopGoodSoldOut";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";

// The wallet, bag and purchases after one of a good is bought at `now` by a player of this Adventure Rank, its price
// Taken And its item given: into the wallet when the item is a currency this rule trades in, otherwise into the bag as
// Its Definition has it, which the bag must hold whole. Undefined where the good is not offered: below its rank,
// Outside its Dates, sold out this refresh, or unaffordable, where its price is no currency this rule trades in, or
// Where the bag Cannot take the item whole
export const buyShopGood = (
  wallet: Wallet,
  inventory: Inventory,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  purchases: ShopPurchase[],
  good: ShopGood,
  adventureRank: number,
  now: Temporal.Instant,
): undefined | { inventory: Inventory; purchases: ShopPurchase[]; wallet: Wallet } => {
  const priceCurrency = ShopItemCurrencyMap[good.priceItemId];
  const itemCurrency = ShopItemCurrencyMap[good.itemId];
  const isInSalePeriod =
    Temporal.Instant.compare(Temporal.Instant.from(good.beginTime), now) <= 0 &&
    Temporal.Instant.compare(now, Temporal.Instant.from(good.endTime)) < 0;
  if (
    priceCurrency === undefined ||
    adventureRank < good.minPlayerLevel ||
    !isInSalePeriod ||
    checkIsShopGoodSoldOut(good, purchases, now) ||
    wallet[priceCurrency] < good.priceCount
  )
    return undefined;
  const boughtPurchases = [...purchases, { goodsId: good.goodsId, purchasedAt: now }];
  const paidWallet = { ...wallet, [priceCurrency]: wallet[priceCurrency] - good.priceCount };
  if (itemCurrency !== undefined)
    return {
      inventory,
      purchases: boughtPurchases,
      wallet: { ...paidWallet, [itemCurrency]: paidWallet[itemCurrency] + good.itemCount },
    };
  const addition = addInventoryItem(inventory, getItemDefinition(good.itemId, names, materialDataMap), good.itemCount);
  if (addition.overflow > 0) return undefined;
  return { inventory: addition.inventory, purchases: boughtPurchases, wallet: paidWallet };
};
