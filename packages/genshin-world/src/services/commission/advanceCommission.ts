import type { Commission } from "#src/models/commission/Commission";
import type { CommissionProgress } from "#src/models/commission/CommissionProgress";

// The progress after `amount` finishing doings, held at the commission's finish count so that doing more than it asks
// Counts for nothing
export const advanceCommission = (
  progress: CommissionProgress,
  commission: Commission,
  amount: number,
): CommissionProgress => ({ ...progress, count: Math.min(progress.count + amount, commission.finishProgress) });
