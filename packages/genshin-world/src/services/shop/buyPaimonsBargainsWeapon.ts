import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { PaimonsBargainsGood } from "#src/models/shop/PaimonsBargainsRotation";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { payShopGood } from "#src/services/shop/payShopGood";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";

// The wallet, bag and purchases after a weapon of Paimon's Bargains is bought at `now`, the weapon being the good's item id,
// Its price taken and the weapon put in the bag whole. Undefined where the good is sold out this month, the wallet cannot pay
// Its price, or the bag cannot take the weapon
export const buyPaimonsBargainsWeapon = (
  wallet: Wallet,
  inventory: Inventory,
  purchases: ShopPurchase[],
  good: PaimonsBargainsGood,
  getWeaponDefinition: (weaponId: number) => ItemDefinition,
  now: Temporal.Instant,
): undefined | { inventory: Inventory; purchases: ShopPurchase[]; wallet: Wallet } => {
  const priceCurrency = ShopItemCurrencyMap[good.priceItemId];
  if (priceCurrency === undefined) return undefined;
  const paid = payShopGood(wallet, purchases, good, priceCurrency, now);
  if (!paid) return undefined;
  const addition = addInventoryItem(inventory, getWeaponDefinition(good.itemId), good.itemCount);
  if (addition.overflow > 0) return undefined;
  return { inventory: addition.inventory, purchases: paid.purchases, wallet: paid.wallet };
};
