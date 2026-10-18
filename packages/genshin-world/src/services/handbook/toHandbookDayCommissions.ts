import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { HandbookDayCommission } from "#src/models/handbook/HandbookDayCommission";

import { checkIsCommissionFinished } from "#src/services/commission/checkIsCommissionFinished";
import { COMMISSIONS_PER_DAY } from "#src/services/commission/constants";
import { RegionGameTextKeyMap } from "#src/services/handbook/RegionGameTextKeyMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The day's commissions in the order they were dealt, each with its title, its preferred region, its progress against the
// Count that finishes it, and whether it is claimed or claimable: a finished one is claimable free, an unfinished one for a
// Whole Encounter Point, and none once the day's four are claimed. A dealt commission the slice holds no task for is an error,
// As findDealtCommission reads it
export const toHandbookDayCommissions = (
  day: CommissionDay,
  { tasks }: CommissionSlice,
  wholeEncounterPoints: number,
): HandbookDayCommission[] =>
  day.dealtCommissions.map((progress) => {
    const { commissionId, count } = progress;
    const commission = tasks.find(({ id }) => id === commissionId);
    if (!commission)
      throw new InvalidOperationError(
        Operation.Read,
        String(commissionId),
        "is dealt, but the slice holds no such task",
      );
    const isClaimed = day.claimedCommissionIds.includes(commissionId);
    const isDayOpen = day.claimedCommissionIds.length < COMMISSIONS_PER_DAY;
    return {
      commissionId,
      isClaimable:
        !isClaimed && isDayOpen && (checkIsCommissionFinished(progress, commission) || wholeEncounterPoints >= 1),
      isClaimed,
      nameTextId: commission.nameTextId,
      progress: count,
      regionTextKey: RegionGameTextKeyMap[commission.preferredRegion],
      total: commission.finishProgress,
    };
  });
