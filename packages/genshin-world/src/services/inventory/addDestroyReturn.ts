import type { InventoryDestruction } from "#src/models/inventory/InventoryDestruction";
import type { ItemCount } from "#src/models/inventory/ItemCount";

import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { WALLET_ITEM_IDS } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The destruction after one material a destroy returned is taken in: a wallet currency into the wallet, any other
// Material into the bag through its add path, which leaves what the bag has no room for where it lies
export const addDestroyReturn = (
  { inventory, wallet }: InventoryDestruction,
  { count, id }: ItemCount,
  names: Readonly<Record<string, string>>,
): InventoryDestruction => {
  if (!WALLET_ITEM_IDS.includes(id))
    return { inventory: addInventoryItem(inventory, getItemDefinition(id, names), count).inventory, wallet };
  const currency = getWalletCurrency(id);
  if (currency === undefined) throw new InvalidOperationError(Operation.Update, addDestroyReturn.name, String(id));
  return { inventory, wallet: { ...wallet, [currency]: wallet[currency] + count } };
};
