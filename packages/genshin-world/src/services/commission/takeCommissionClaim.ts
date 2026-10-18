import type { Commission } from "#src/models/commission/Commission";
import type { CommissionClaim } from "#src/models/commission/CommissionClaim";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionProgress } from "#src/models/commission/CommissionProgress";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { computeCommissionBand } from "#src/services/commission/computeCommissionBand";
import { COMMISSIONS_PER_DAY } from "#src/services/commission/constants";
import { takeBandItems } from "#src/services/commission/takeBandItems";
import { drawRewardItems } from "#src/services/reward/drawRewardItems";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The state after a dealt commission is claimed: its reward drawn for the rank it was dealt at. Undefined where the day's
// Four are claimed already
export const takeCommissionClaim = (
  day: CommissionDay,
  encounterPoints: number,
  { commission, progress }: { commission: Commission; progress: CommissionProgress },
  slice: CommissionSlice,
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
  return {
    day: { ...day, claimedCommissionIds: [...day.claimedCommissionIds, commission.id] },
    encounterPoints,
    rewards: drawRewardItems(
      takeBandItems(rewardTier.bands, computeCommissionBand(progress.dealtRank), String(commission.id)),
      random,
    ),
  };
};
