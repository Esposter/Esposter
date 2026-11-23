import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCategoryRoomMap } from "#src/models/inventory/ItemCategoryRoomMap";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { PaimonsBargainsGood } from "#src/models/shop/PaimonsBargainsRotation";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { checkIsCurrencyOnlyGood } from "#src/services/shop/checkIsCurrencyOnlyGood";
import { payShopGoodCosts } from "#src/services/shop/payShopGoodCosts";

// The wallet, bag and purchases after a weapon of Paimon's Bargains is bought at `now`.
// The weapon is the good's item id, its price taken, and the weapon put in the bag whole.
// Undefined where the good is sold out this month, the wallet cannot pay its price, or the bag cannot take the weapon.
export const buyPaimonsBargainsWeapon = (
  wallet: Wallet,
  inventory: Inventory,
  purchases: ShopPurchase[],
  good: PaimonsBargainsGood,
  getWeaponDefinition: (weaponId: number) => ItemDefinition,
  now: Temporal.Instant,
  itemRooms: ItemCategoryRoomMap,
): { inventory: Inventory; purchases: ShopPurchase[]; wallet: Wallet } | undefined => {
  if (!checkIsCurrencyOnlyGood(good)) return undefined;
  const paid = payShopGoodCosts(wallet, inventory, purchases, good, now);
  if (!paid) return undefined;
  const addition = addInventoryItem(paid.inventory, getWeaponDefinition(good.itemId), good.itemCount, itemRooms);
  if (addition.overflow > 0) return undefined;
  return { inventory: addition.inventory, purchases: paid.purchases, wallet: paid.wallet };
};
