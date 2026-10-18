import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { BlossomClaimOffer } from "#src/models/originalResin/BlossomClaimOffer";
import type { ResinClaim } from "#src/models/originalResin/ResinClaim";

import { claimResinReward } from "#src/services/originalResin/claimResinReward";

// The Petrified Tree a cleared domain raises is claimed through the offer the player chose from the claim prompt, the
// Same prompt a ley line outcrop uses. Each of the offer's claims draws its rewards from `drawRewards`, the tree's draw
// Passed in until that draw is built, and the one Resin claim every reward goes through takes the offer's price
export const claimPetrifiedTree = (
  adventureRankTables: AdventureRankTables,
  wallet: Wallet,
  inventory: Inventory,
  offer: BlossomClaimOffer,
  drawRewards: () => ItemCount[],
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
    Array.from({ length: offer.claimCount }, () => drawRewards()).flat(),
    adventureExp,
    completedMainQuestIds,
    now,
    names,
    materialDataMap,
  );
