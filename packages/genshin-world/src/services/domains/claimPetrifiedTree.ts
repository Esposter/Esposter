import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { ResinClaim } from "#src/models/originalResin/ResinClaim";
import type { RewardItem } from "#src/models/reward/RewardItem";

import { claimResinReward } from "#src/services/originalResin/claimResinReward";
import { drawRewardItems } from "#src/services/reward/drawRewardItems";

// The Petrified Tree a cleared domain raises is claimed through the offer the player chose from the claim prompt, the
// Same prompt a ley line outcrop uses. Each of the offer's claims draws the tree's items from `treeRewards` by `random`,
// Each item's count between its least and most, and the one Resin claim every reward goes through takes the offer's price
export const claimPetrifiedTree = (
  adventureRankTables: AdventureRankTables,
  wallet: Wallet,
  inventory: Inventory,
  offer: BlossomClaimOffer,
  treeRewards: RewardItem[],
  random: () => number,
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
    offer,
    Array.from({ length: offer.claimCount }, () => drawRewardItems(treeRewards, random)).flat(),
    adventureExp,
    completedMainQuestIds,
    now,
    names,
    materialDataMap,
  );
