import type { Inventory } from "#src/models/inventory/Inventory";
import type { ShopGood, ShopGoodLimit } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { checkIsShopGoodSoldOut } from "#src/services/shop/checkIsShopGoodSoldOut";
import { recordShopPurchase } from "#src/services/shop/recordShopPurchase";

// The bag and purchases after a good is paid for in an item the bag holds, the price taken out of the bag and the purchase of
// The good recorded at `now`. Undefined where the good is sold out this refresh or the bag holds too few of the price's item
export const payShopGoodFromBag = (
  inventory: Inventory,
  purchases: ShopPurchase[],
  good: ShopGoodLimit & Pick<ShopGood, "priceCount" | "priceItemId">,
  now: Temporal.Instant,
): undefined | { inventory: Inventory; purchases: ShopPurchase[] } => {
  if (
    checkIsShopGoodSoldOut(good, purchases, now) ||
    countInventoryItem(inventory.items, good.priceItemId) < good.priceCount
  )
    return undefined;
  return {
    inventory: { ...inventory, items: takeInventoryItems(inventory.items, good.priceItemId, good.priceCount) },
    purchases: recordShopPurchase(purchases, good, now),
  };
};
