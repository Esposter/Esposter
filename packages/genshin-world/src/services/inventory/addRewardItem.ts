import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { WALLET_ITEM_IDS } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The bag and the wallet after one item is taken in as the game gives it, a destroy's return or a quest's reward: a wallet
// Currency into the wallet, any other item into the bag through its add path. Undefined where the bag cannot take the item
// Whole, which refuses it
export const addRewardItem = (
  { inventory, wallet }: { inventory: Inventory; wallet: Wallet },
  { count, id }: ItemCount,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): undefined | { inventory: Inventory; wallet: Wallet } => {
  if (!WALLET_ITEM_IDS.includes(id)) {
    const addition = addInventoryItem(inventory, getItemDefinition(id, names, materialDataMap), count);
    return addition.overflow > 0 ? undefined : { inventory: addition.inventory, wallet };
  }
  const currency = getWalletCurrency(id);
  if (currency === undefined) throw new InvalidOperationError(Operation.Update, addRewardItem.name, String(id));
  return { inventory, wallet: { ...wallet, [currency]: wallet[currency] + count } };
};
