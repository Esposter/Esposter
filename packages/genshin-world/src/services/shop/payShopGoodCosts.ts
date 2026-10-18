import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood, ShopGoodLimit } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { checkIsShopGoodSoldOut } from "#src/services/shop/checkIsShopGoodSoldOut";
import { countShopCost } from "#src/services/shop/countShopCost";
import { recordShopPurchase } from "#src/services/shop/recordShopPurchase";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";

// The wallet, bag and purchases after every cost of a good is paid at `now`: each taken out of the currency it is in or out
// Of the bag, and the purchase recorded once. Undefined where the good is sold out this refresh or the player holds too few of
// Any one of its costs, so a good is paid for whole or not at all
export const payShopGoodCosts = (
  wallet: Wallet,
  inventory: Inventory,
  purchases: ShopPurchase[],
  good: Pick<ShopGood, "costs"> & ShopGoodLimit,
  now: Temporal.Instant,
): undefined | { inventory: Inventory; purchases: ShopPurchase[]; wallet: Wallet } => {
  if (
    checkIsShopGoodSoldOut(good, purchases, now) ||
    good.costs.some(({ count, itemId }) => countShopCost(inventory, wallet, itemId) < count)
  )
    return undefined;
  const paidWallet = { ...wallet };
  let paidItems = inventory.items;
  for (const { count, itemId } of good.costs) {
    const currency = ShopItemCurrencyMap[itemId];
    if (currency === undefined) paidItems = takeInventoryItems(paidItems, itemId, count);
    else paidWallet[currency] -= count;
  }
  return {
    inventory: { ...inventory, items: paidItems },
    purchases: recordShopPurchase(purchases, good, now),
    wallet: paidWallet,
  };
};
