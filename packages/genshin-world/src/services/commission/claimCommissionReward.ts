import type { CommissionClaim } from "#src/models/commission/CommissionClaim";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { checkIsCommissionFinished } from "#src/services/commission/checkIsCommissionFinished";
import { findDealtCommission } from "#src/services/commission/findDealtCommission";
import { takeCommissionClaim } from "#src/services/commission/takeCommissionClaim";

// The state after a dealt commission's reward is claimed. A finished commission is claimed free; an unfinished one is
// Claimed for one Encounter Point, which it spends. Undefined where it is not dealt, is claimed already, or the day's four
// Are claimed, or where it is unfinished and no point is held
export const claimCommissionReward = (
  day: CommissionDay,
  encounterPoints: number,
  commissionId: number,
  slice: CommissionSlice,
  random: () => number,
): CommissionClaim | undefined => {
  const dealt = findDealtCommission(day, commissionId, slice);
  if (!dealt) return undefined;
  if (checkIsCommissionFinished(dealt.progress, dealt.commission))
    return takeCommissionClaim(day, encounterPoints, dealt, slice, random);
  if (encounterPoints < 1) return undefined;
  return takeCommissionClaim(day, encounterPoints - 1, dealt, slice, random);
};
