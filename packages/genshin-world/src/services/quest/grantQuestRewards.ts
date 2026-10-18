import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { QuestRewardItem } from "#src/models/quest/Quest";

import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { addRewardItem } from "#src/services/inventory/addRewardItem";
import { CHARACTER_EXP_ITEM_ID } from "#src/services/inventory/constants";

// The bag and the wallet after a quest's finish pays its rewards in order, and the Adventure EXP they pay for the rank to
// Gain, which the Adventure Rank takes rather than the bag or the wallet. Character EXP is left out, since no grant pays it
// Yet. An item the bag cannot take whole is left out, as a catch leaves its overflow out, since no mail carries it
export const grantQuestRewards = (
  rewards: QuestRewardItem[],
  inventory: Inventory,
  wallet: Wallet,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): { adventureExp: number; inventory: Inventory; wallet: Wallet } => {
  let adventureExp = 0;
  let grantedInventory = inventory;
  let grantedWallet = wallet;
  for (const { count, itemId } of rewards) {
    if (itemId === CHARACTER_EXP_ITEM_ID) continue;
    if (itemId === ADVENTURE_EXP_ITEM_ID) {
      adventureExp += count;
      continue;
    }
    const taken = addRewardItem(
      { inventory: grantedInventory, wallet: grantedWallet },
      { count, id: itemId },
      names,
      materialDataMap,
    );
    if (taken) {
      grantedInventory = taken.inventory;
      grantedWallet = taken.wallet;
    }
  }
  return { adventureExp, inventory: grantedInventory, wallet: grantedWallet };
};
