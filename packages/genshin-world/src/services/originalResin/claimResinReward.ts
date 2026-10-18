import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ResinClaim } from "#src/models/originalResin/ResinClaim";
import type { ResinCost } from "#src/models/originalResin/ResinCost";

import { CONDENSED_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { takeInventoryItems } from "#src/services/inventory/takeInventoryItems";
import { claimOriginalResin } from "#src/services/originalResin/claimOriginalResin";
import { grantRewardItems } from "#src/services/reward/grantRewardItems";

// The one claim every resin reward goes through, whatever challenge pays it: a cost of Original Resin, or of Condensed
// Resin where its count is above zero, and the reward list the challenge drew. Original Resin pays its Adventure EXP
// Through `claimOriginalResin`, and the reward list is granted as `grantRewardItems` grants it. Undefined where the cost
// Is not held, or the bag cannot take every item whole, which keeps the resin or the Condensed Resin in hand
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
  const granted = grantRewardItems(paid.wallet, paid.inventory, rewards, names, materialDataMap);
  if (!granted) return undefined;
  return { adventureExp: paid.adventureExp, ...granted };
};
