import type { Commission } from "#src/models/commission/Commission";
import type { CommissionProgress } from "#src/models/commission/CommissionProgress";

// Whether a commission's count has reached its finish count. A quest task's finish count is its quest's one completion,
// So it is finished once its quest completes and advances it
export const checkIsCommissionFinished = (progress: CommissionProgress, commission: Commission): boolean =>
  progress.count >= commission.finishProgress;
