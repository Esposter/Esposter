import type { DevCommand } from "#src/models/dev/DevCommand";
import type { DevItemTables } from "#src/models/dev/DevItemTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { resolveDevItem } from "#src/services/dev/resolveDevItem";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { getWalletCurrency } from "#src/services/inventory/getWalletCurrency";
import { z } from "zod";

const bagArgs = z.object({ item: z.string().min(1) });

// `bag <item>` counts an item across the bag's stacks and the wallet, the item named the way `give` names one. An item
// Neither holds counts zero
export const createBagCommand = ({
  getInventory,
  getWallet,
  itemTables,
}: {
  getInventory: () => Inventory;
  getWallet: () => Wallet;
  itemTables: DevItemTables;
}): DevCommand<typeof bagArgs> => ({
  args: bagArgs,
  argumentNames: ["item"],
  name: "bag",
  run: ({ item }) => {
    const resolution = resolveDevItem(item, itemTables);
    if (!resolution.ok) return resolution;

    const { id } = resolution.entry;
    const currency = getWalletCurrency(id);
    const walletCount = currency === undefined ? 0 : getWallet()[currency];
    return { ok: true, value: countInventoryItem(getInventory().items, id) + walletCount };
  },
});
