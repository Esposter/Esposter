import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ResinClaim } from "#src/models/originalResin/ResinClaim";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { drawNormalBossReward } from "#src/services/bosses/drawNormalBossReward";
import { claimResinReward } from "#src/services/originalResin/claimResinReward";
import { BlossomClaimResinMap } from "#src/services/originalResin/BlossomClaimResinMap";

// A claim at a normal boss's Trounce Blossom: the boss's price in Original Resin, and the reward its World Level and its
// Own drop draw. Undefined where the resin or the bag cannot pay it, as any resin claim is refused
export const claimTrounceBlossom = (
  adventureRankTables: AdventureRankTables,
  wallet: Wallet,
  inventory: Inventory,
  worldLevel: number,
  uniqueDropId: number,
  adventureExp: number,
  completedMainQuestIds: ReadonlySet<string>,
  now: Temporal.Instant,
  names: Readonly<Record<string, string>>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
  random: () => number,
): ResinClaim | undefined =>
  claimResinReward(
    adventureRankTables,
    wallet,
    inventory,
    { condensedResinCount: 0, resin: BlossomClaimResinMap[BlossomKind.NormalBoss] },
    drawNormalBossReward(worldLevel, uniqueDropId, random),
    adventureExp,
    completedMainQuestIds,
    now,
    names,
    materialDataMap,
  );
