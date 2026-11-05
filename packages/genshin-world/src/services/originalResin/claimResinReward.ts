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
import { ADVENTURE_EXP_PER_RESIN } from "#src/services/originalResin/constants";
import { spendOriginalResin } from "#src/services/originalResin/spendOriginalResin";
import { routeRewardItems } from "#src/services/reward/routeRewardItems";

// The one claim every resin reward goes through, whatever challenge pays it: a cost of Original Resin, or of Condensed
// Resin where its count is above zero, and the reward list the challenge drew. The Original Resin spent gives its Adventure
// EXP, and the reward list is taken in through `routeRewardItems`. Undefined where the cost is not held, or the bag cannot
// take every item whole, which keeps the resin or the Condensed Resin in hand
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
  if (cost.condensedResinCount > 0) {
    if (countInventoryItem(inventory.items, CONDENSED_RESIN_ITEM_ID) < cost.condensedResinCount) return undefined;
    return routeRewardItems(
      adventureRankTables,
      adventureExp,
      0,
      completedMainQuestIds,
      wallet,
      { ...inventory, items: takeInventoryItems(inventory.items, CONDENSED_RESIN_ITEM_ID, cost.condensedResinCount) },
      rewards,
      names,
      materialDataMap,
    );
  }
  const spentWallet = spendOriginalResin(wallet, cost.resin, now);
  if (!spentWallet) return undefined;
  return routeRewardItems(
    adventureRankTables,
    adventureExp,
    cost.resin * ADVENTURE_EXP_PER_RESIN,
    completedMainQuestIds,
    spentWallet,
    inventory,
    rewards,
    names,
    materialDataMap,
  );
};
