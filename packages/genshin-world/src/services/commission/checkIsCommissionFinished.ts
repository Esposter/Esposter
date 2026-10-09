import type { Commission } from "#src/models/commission/Commission";
import type { CommissionProgress } from "#src/models/commission/CommissionProgress";

import { CommissionKind } from "#src/models/commission/CommissionKind";

// Whether a scene task's count has reached its finish count. A quest task finishes with its quest, which the world does
// Not report yet, so it stays unfinished
export const checkIsCommissionFinished = (progress: CommissionProgress, commission: Commission): boolean =>
  commission.kind === CommissionKind.Scene && progress.count >= commission.finishProgress;
