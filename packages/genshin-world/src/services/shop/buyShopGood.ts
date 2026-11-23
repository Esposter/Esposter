import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCategoryRoomMap } from "#src/models/inventory/ItemCategoryRoomMap";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { checkIsShopGoodOffered } from "#src/services/shop/checkIsShopGoodOffered";
import { giveShopGood } from "#src/services/shop/giveShopGood";
import { payShopGoodCosts } from "#src/services/shop/payShopGoodCosts";

// The wallet, bag and purchases after one of a good is bought at `now` by a player of this Adventure Rank.
// Every cost is taken and the item given. A cost in a currency this rule trades in is paid from the wallet.
// Any other cost is an item the bag holds, and is paid from the bag.
// Undefined where the good is not offered: below its Rank, outside its dates, or sold out this refresh.
// It is also undefined when a cost is not affordable, or where the bag cannot take the item whole.
export const buyShopGood = (
  wallet: Wallet,
  inventory: Inventory,
  getGoodItemDefinition: (itemId: number) => ItemDefinition,
  purchases: ShopPurchase[],
  good: ShopGood,
  adventureRank: number,
  now: Temporal.Instant,
  itemRooms: ItemCategoryRoomMap,
): { inventory: Inventory; purchases: ShopPurchase[]; wallet: Wallet } | undefined => {
  if (!checkIsShopGoodOffered(good, adventureRank, now)) return undefined;
  const paid = payShopGoodCosts(wallet, inventory, purchases, good, now);
  if (!paid) return undefined;
  const given = giveShopGood(paid.wallet, paid.inventory, getGoodItemDefinition, good, itemRooms);
  return given && { ...given, purchases: paid.purchases };
};
