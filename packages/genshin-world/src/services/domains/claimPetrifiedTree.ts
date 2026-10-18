import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ResinClaim } from "#src/models/originalResin/ResinClaim";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { claimResinReward } from "#src/services/originalResin/claimResinReward";
import { computeBlossomClaimResin } from "#src/services/originalResin/computeBlossomClaimResin";

// The Petrified Tree a cleared domain raises is claimed once, at a domain's single price in Original Resin, through the one
// Resin claim every reward goes through. Its rewards are the list the tree's draw gives, passed in until that draw is built
export const claimPetrifiedTree = (
  adventureRankTables: AdventureRankTables,
  wallet: Wallet,
  inventory: Inventory,
  rewards: ItemCount[],
  adventureExp: number,
  completedMainQuestIds: ReadonlySet<string>,
  now: Temporal.Instant,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): ResinClaim | undefined =>
  claimResinReward(
    adventureRankTables,
    wallet,
    inventory,
    { condensedResinCount: 0, resin: computeBlossomClaimResin(BlossomKind.Domain, 0) },
    rewards,
    adventureExp,
    completedMainQuestIds,
    now,
    names,
    materialDataMap,
  );
