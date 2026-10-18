import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";
import type { Character } from "#src/models/character/Character";
import type { CommissionClaimOutcome } from "#src/models/commission/CommissionClaimOutcome";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Party } from "#src/models/party/Party";

import { claimCommissionReward } from "#src/services/commission/claimCommissionReward";
import { HALF_POINTS_PER_ENCOUNTER_POINT } from "#src/services/commission/constants";
import { readEncounterPoints } from "#src/services/commission/readEncounterPoints";
import { routeCommissionClaim } from "#src/services/commission/routeCommissionClaim";

// A dealt commission claimed with the Encounter Points the save holds: the points as they stand at `now`, the claim drawn
// Through `claimCommissionReward` and routed by `routeCommissionClaim`, and the point an unfinished commission takes
// Spent from the half points held. Undefined where either refuses the claim, so nothing is spent, routed or recorded
export const claimCommissionWithPoints = ({
  adventureExp,
  adventureRankTables,
  characters,
  commissionDay,
  commissionId,
  completedMainQuestIds,
  encounterPoints,
  friendshipLevels,
  inventory,
  materialDataMap,
  names,
  now,
  party,
  rank,
  random,
  slice,
  wallet,
}: {
  adventureExp: number;
  adventureRankTables: AdventureRankTables;
  characters: readonly Character[];
  commissionDay: CommissionDay;
  commissionId: number;
  completedMainQuestIds: ReadonlySet<string>;
  encounterPoints: EncounterPoints;
  friendshipLevels: readonly FriendshipLevel[];
  inventory: Inventory;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  names: Readonly<Record<string, string>>;
  now: Temporal.Instant;
  party: Party;
  rank: number;
  random: () => number;
  slice: CommissionSlice;
  wallet: Wallet;
}): CommissionClaimOutcome | undefined => {
  const points = readEncounterPoints(encounterPoints, now);
  const wholePoints = Math.floor(points.halfPoints / HALF_POINTS_PER_ENCOUNTER_POINT);
  const claim = claimCommissionReward(commissionDay, wholePoints, commissionId, slice, rank, random);
  if (!claim) return undefined;
  const routing = routeCommissionClaim(
    adventureRankTables,
    adventureExp,
    characters,
    claim,
    completedMainQuestIds,
    friendshipLevels,
    inventory,
    materialDataMap,
    names,
    party,
    wallet,
  );
  if (!routing) return undefined;
  const spentPoints = wholePoints - claim.encounterPoints;
  return {
    commissionDay: claim.day,
    encounterPoints: { ...points, halfPoints: points.halfPoints - spentPoints * HALF_POINTS_PER_ENCOUNTER_POINT },
    routing,
  };
};
