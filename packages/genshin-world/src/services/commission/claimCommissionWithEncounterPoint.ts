import type { CommissionClaim } from "#src/models/commission/CommissionClaim";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { findDealtCommission } from "#src/services/commission/findDealtCommission";
import { takeCommissionClaim } from "#src/services/commission/takeCommissionClaim";

// The state after a dealt commission's reward is claimed for one Encounter Point, the commission unfinished. Undefined
// Where no point is held, the commission is not dealt or is claimed already, or the day's four are claimed
export const claimCommissionWithEncounterPoint = (
  day: CommissionDay,
  encounterPoints: number,
  commissionId: number,
  slice: CommissionSlice,
  rank: number,
  random: () => number,
): CommissionClaim | undefined => {
  const dealt = findDealtCommission(day, commissionId, slice);
  if (!dealt || encounterPoints < 1) return undefined;
  return takeCommissionClaim(day, encounterPoints - 1, dealt, slice, rank, random);
};
