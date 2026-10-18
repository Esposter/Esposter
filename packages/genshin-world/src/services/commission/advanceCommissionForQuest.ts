import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { CommissionKind } from "#src/models/commission/CommissionKind";
import { advanceCommission } from "#src/services/commission/advanceCommission";
import { findDealtCommission } from "#src/services/commission/findDealtCommission";

// The day after `questId` completes: the dealt, unclaimed quest task whose quest it is advanced by its one doing, its
// Quest's completion, so checkIsCommissionFinished reads it finished. Any other commission is left as it is
export const advanceCommissionForQuest = (
  day: CommissionDay,
  slice: CommissionSlice,
  questId: string,
): CommissionDay => ({
  ...day,
  dealtCommissions: day.dealtCommissions.map((progress) => {
    const dealt = findDealtCommission(day, progress.commissionId, slice);
    return dealt?.commission.kind === CommissionKind.Quest && dealt.commission.questId === questId
      ? advanceCommission(progress, dealt.commission, 1)
      : progress;
  }),
});
