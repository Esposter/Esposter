import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";

// The wallet and bag after a good's item is given: into the wallet when the item is a currency this rule trades in, otherwise
// Into the bag as `getGoodItemDefinition` defines it, which the bag must hold whole. Undefined where the bag cannot take it whole
export const giveShopGood = (
  wallet: Wallet,
  inventory: Inventory,
  getGoodItemDefinition: (itemId: number) => ItemDefinition,
  good: ShopGood,
): undefined | { inventory: Inventory; wallet: Wallet } => {
  const itemCurrency = ShopItemCurrencyMap[good.itemId];
  if (itemCurrency !== undefined)
    return { inventory, wallet: { ...wallet, [itemCurrency]: wallet[itemCurrency] + good.itemCount } };
  const addition = addInventoryItem(inventory, getGoodItemDefinition(good.itemId), good.itemCount);
  if (addition.overflow > 0) return undefined;
  return { inventory: addition.inventory, wallet };
};
