import type { Commission } from "#src/models/commission/Commission";
import type { CommissionDay } from "#src/models/commission/CommissionDay";
import type { CommissionProgress } from "#src/models/commission/CommissionProgress";
import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A commission dealt today and not yet claimed, with its progress. Undefined where the day holds no such commission, or
// It is claimed already
export const findDealtCommission = (
  day: CommissionDay,
  commissionId: number,
  slice: CommissionSlice,
): undefined | { commission: Commission; progress: CommissionProgress } => {
  const progress = day.dealtCommissions.find(({ commissionId: dealtId }) => dealtId === commissionId);
  if (!progress || day.claimedCommissionIds.includes(commissionId)) return undefined;
  const commission = slice.tasks.find(({ id }) => id === commissionId);
  if (!commission)
    throw new InvalidOperationError(Operation.Read, String(commissionId), "is dealt, but the slice holds no such task");
  return { commission, progress };
};
