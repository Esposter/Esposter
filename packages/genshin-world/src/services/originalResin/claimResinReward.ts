import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ResinClaim } from "#src/models/originalResin/ResinClaim";
import type { ResinCost } from "#src/models/originalResin/ResinCost";

import { Currency } from "#src/models/inventory/Currency";
import { CONDENSED_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { claimOriginalResin } from "#src/services/originalResin/claimOriginalResin";
import { COMPANIONSHIP_EXP_ITEM_ID } from "#src/services/originalResin/constants";

// The one claim every resin reward goes through, whatever challenge pays it: a cost of Original Resin, or of Condensed
// Resin where its count is above zero, and the reward list the challenge drew. Original Resin pays its Adventure EXP
// Through `claimOriginalResin`, the Mora in the list goes into the wallet, and the rest goes into the bag. The Adventure
// And Companionship EXP items in the list are left out. Undefined where the cost is not held, or the bag cannot take
// Every item whole, which keeps the resin or the Condensed Resin in hand
export const claimResinReward = (
  adventureRankTables: AdventureRankTables,
  wallet: Wallet,
  inventory: Inventory,
  cost: ResinCost,
  rewards: ItemCount[],
  adventureExp: number,
  completedMainQuestIds: ReadonlySet<string>,
  now: Temporal.Instant,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): ResinClaim | undefined => {
  let paid: ResinClaim | undefined;
  if (cost.condensedResinCount > 0) {
    if (countInventoryItem(inventory.items, CONDENSED_RESIN_ITEM_ID) >= cost.condensedResinCount)
      paid = {
        adventureExp,
        inventory: {
          ...inventory,
          items: takeInventoryItems(inventory.items, CONDENSED_RESIN_ITEM_ID, cost.condensedResinCount),
        },
        wallet,
      };
  } else {
    const claimedResin = claimOriginalResin(
      adventureRankTables,
      wallet,
      cost.resin,
      adventureExp,
      completedMainQuestIds,
      now,
    );
    if (claimedResin) paid = { adventureExp: claimedResin.adventureExp, inventory, wallet: claimedResin.wallet };
  }
  if (!paid) return undefined;
  let claimedInventory = paid.inventory;
  let moraCount = 0;
  for (const { count, id } of rewards)
    if (id === MORA_ITEM_ID) moraCount += count;
    else if (id !== ADVENTURE_EXP_ITEM_ID && id !== COMPANIONSHIP_EXP_ITEM_ID) {
      const addition = addInventoryItem(claimedInventory, getItemDefinition(id, names, materialDataMap), count);
      if (addition.overflow > 0) return undefined;
      claimedInventory = addition.inventory;
    }
  return {
    adventureExp: paid.adventureExp,
    inventory: claimedInventory,
    wallet: { ...paid.wallet, [Currency.Mora]: paid.wallet[Currency.Mora] + moraCount },
  };
};
