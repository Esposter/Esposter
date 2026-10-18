import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";

import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { addRewardItem } from "#src/services/inventory/addRewardItem";
import { COMPANIONSHIP_EXP_ITEM_ID } from "#src/services/originalResin/constants";

// Grants a reward's items, each through the path a single item takes: the Mora and other currencies into the wallet.
// The rest go into the bag. The Adventure and Companionship EXP items are left out, since the EXP is paid to the
// Adventure Rank by its own route. Undefined where the bag cannot take an item whole, so nothing is granted
export const grantRewardItems = (
  wallet: Wallet,
  inventory: Inventory,
  rewards: ItemCount[],
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): undefined | { inventory: Inventory; wallet: Wallet } => {
  let granted: undefined | { inventory: Inventory; wallet: Wallet } = { inventory, wallet };
  for (const reward of rewards) {
    if (reward.id === ADVENTURE_EXP_ITEM_ID || reward.id === COMPANIONSHIP_EXP_ITEM_ID) continue;
    granted = addRewardItem(granted, reward, names, materialDataMap);
    if (granted === undefined) return undefined;
  }
  return granted;
};
