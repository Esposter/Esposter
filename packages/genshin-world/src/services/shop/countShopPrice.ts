import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";

// How many of a good's price the player holds: the wallet's count when the price is a currency the wallet trades, else the
// Bag's count of the item, as a fish is spent from the bag
export const countShopPrice = (inventory: Inventory, wallet: Wallet, priceItemId: number): number => {
  const currency = ShopItemCurrencyMap[priceItemId];
  return currency === undefined ? countInventoryItem(inventory.items, priceItemId) : wallet[currency];
};
