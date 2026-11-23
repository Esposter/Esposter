import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCategoryRoomMap } from "#src/models/inventory/ItemCategoryRoomMap";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { buyShopGood } from "#src/services/shop/buyShopGood";

// The wallet, bag and purchases after the player buys a good `count` times at `now`.
// Each buy takes the price and gives the item as `buyShopGood` does.
// The first buy refused ends the count, so a count past what the player can pay buys what it can.
export const buyShopGoodCount = (
  wallet: Wallet,
  inventory: Inventory,
  getGoodItemDefinition: (itemId: number) => ItemDefinition,
  purchases: ShopPurchase[],
  good: ShopGood,
  count: number,
  adventureRank: number,
  now: Temporal.Instant,
  itemRooms: ItemCategoryRoomMap,
): { inventory: Inventory; purchases: ShopPurchase[]; wallet: Wallet } => {
  let state = { inventory, purchases, wallet };
  for (let index = 0; index < count; index++) {
    const bought = buyShopGood(
      state.wallet,
      state.inventory,
      getGoodItemDefinition,
      state.purchases,
      good,
      adventureRank,
      now,
      itemRooms,
    );
    if (!bought) break;
    state = bought;
  }
  return state;
};
