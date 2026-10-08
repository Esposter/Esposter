import type { CommissionClaim } from "#src/models/commission/CommissionClaim";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { checkIsCommissionFinished } from "#src/services/commission/checkIsCommissionFinished";
import { findDealtCommission } from "#src/services/commission/findDealtCommission";
import { takeCommissionClaim } from "#src/services/commission/takeCommissionClaim";

// The state after a finished commission is claimed. Undefined where it is not dealt, is claimed already, is not finished,
// Or the day's four are claimed
export const claimCommissionReward = (
  day: CommissionDay,
  encounterPoints: number,
  commissionId: number,
  slice: CommissionSlice,
  rank: number,
  random: () => number,
): CommissionClaim | undefined => {
  const dealt = findDealtCommission(day, commissionId, slice);
  if (!dealt || !checkIsCommissionFinished(dealt.progress, dealt.commission)) return undefined;
  return takeCommissionClaim(day, encounterPoints, dealt, slice, rank, random);
};
