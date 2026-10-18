import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { buyShopGood } from "#src/services/shop/buyShopGood";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";

// The bag, wallet and purchases after one of the Realm Depot's goods is bought at `now`: its price taken from the wallet and
// Its item given, a currency to the wallet and anything else into the bag as `itemDefinition` takes it. Undefined where the
// Shop refuses the good, or the bag has no room for its item, so nothing is spent
export const buyHomeDepotGood = (
  good: ShopGood,
  {
    adventureRank,
    inventory,
    itemDefinition,
    now,
    purchases,
    wallet,
  }: {
    adventureRank: number;
    inventory: Inventory;
    itemDefinition: ItemDefinition;
    now: Temporal.Instant;
    purchases: ShopPurchase[];
    wallet: Wallet;
  },
): undefined | { inventory: Inventory; purchases: ShopPurchase[]; wallet: Wallet } => {
  const bought = buyShopGood(wallet, purchases, good, adventureRank, now);
  if (!bought) return undefined;
  if (ShopItemCurrencyMap[good.itemId] !== undefined) return { ...bought, inventory };
  const addition = addInventoryItem(inventory, itemDefinition, good.itemCount);
  if (addition.overflow > 0) return undefined;
  return { inventory: addition.inventory, purchases: bought.purchases, wallet: bought.wallet };
};
