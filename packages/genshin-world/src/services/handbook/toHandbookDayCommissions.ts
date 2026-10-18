import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";
import type { HandbookDayCommission } from "#src/models/handbook/HandbookDayCommission";

import { RegionGameTextKeyMap } from "#src/services/handbook/RegionGameTextKeyMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The day's commissions in the order they were dealt, each with its title, its preferred region and its progress against
// The count that finishes it. A dealt commission the slice holds no task for is an error, as findDealtCommission reads it
export const toHandbookDayCommissions = (day: CommissionDay, { tasks }: CommissionSlice): HandbookDayCommission[] =>
  day.dealtCommissions.map(({ commissionId, count }) => {
    const commission = tasks.find(({ id }) => id === commissionId);
    if (!commission)
      throw new InvalidOperationError(
        Operation.Read,
        String(commissionId),
        "is dealt, but the slice holds no such task",
      );
    return {
      nameTextId: commission.nameTextId,
      progress: count,
      regionTextKey: RegionGameTextKeyMap[commission.preferredRegion],
      total: commission.finishProgress,
    };
  });
