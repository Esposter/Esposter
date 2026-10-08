import type { Commission } from "#src/models/commission/Commission";
import type { CommissionClaim } from "#src/models/commission/CommissionClaim";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionProgress } from "#src/models/commission/CommissionProgress";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { ItemCount } from "#src/models/inventory/ItemCount";
import type { RewardItem } from "#src/models/reward/RewardItem";

import { computeCommissionBand } from "#src/services/commission/computeCommissionBand";
import { COMMISSIONS_PER_DAY } from "#src/services/commission/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Each item of a reward drawn to a count in its range by `random`, the items drawn to nothing left out
const drawRewardItems = (items: RewardItem[], random: () => number): ItemCount[] =>
  items
    .map(({ itemId, maxCount, minCount }) => ({
      count: minCount + Math.floor(random() * (maxCount - minCount + 1)),
      id: itemId,
    }))
    .filter(({ count }) => count > 0);

// The items of one band of a reward table, an error where the table has no such band
const takeBandItems = (bands: RewardItem[][], bandIndex: number, owner: string): RewardItem[] => {
  const items = bands[bandIndex];
  if (!items) throw new InvalidOperationError(Operation.Read, owner, `has no items for band ${bandIndex}`);
  return items;
};

// The state after a dealt commission is claimed: its reward drawn for the rank it was dealt at, and on the day's fourth
// Claim Katheryne's bonus drawn for the rank the player holds now. Undefined where the day's four are claimed already
export const takeCommissionClaim = (
  day: CommissionDay,
  encounterPoints: number,
  { commission, progress }: { commission: Commission; progress: CommissionProgress },
  slice: CommissionSlice,
  rank: number,
  random: () => number,
): CommissionClaim | undefined => {
  if (day.claimedCommissionIds.length >= COMMISSIONS_PER_DAY) return undefined;
  const rewardTier = slice.rewardTiers.find(({ tier }) => tier === commission.rewardTier);
  if (!rewardTier)
    throw new InvalidOperationError(
      Operation.Read,
      String(commission.id),
      `names reward tier ${commission.rewardTier}, which the slice does not hold`,
    );
  const claimedCommissionIds = [...day.claimedCommissionIds, commission.id];
  const isDaysFourth = claimedCommissionIds.length === COMMISSIONS_PER_DAY;
  return {
    bonus: isDaysFourth
      ? drawRewardItems(takeBandItems(slice.bonuses, computeCommissionBand(rank), "the daily bonus"), random)
      : [],
    day: { ...day, claimedCommissionIds },
    encounterPoints,
    rewards: drawRewardItems(
      takeBandItems(rewardTier.bands, computeCommissionBand(progress.dealtRank), String(commission.id)),
      random,
    ),
  };
};
