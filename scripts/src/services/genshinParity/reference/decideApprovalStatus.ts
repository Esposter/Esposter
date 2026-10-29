import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";
import type { ParityApproval } from "#src/models/genshinParity/shared/ParityApproval";

import { ApprovalStatus } from "#src/models/genshinParity/reference/ApprovalStatus";
import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";

// A compare's status against its bar. Only a compare against a reference on disk that judges the whole screen has a score
// To set against the bar, on the measure the screen records; a missing reference and a failed compare have none, and a
// Reference judging a region or another state judges less than the whole screen. A score at the bar is not under it
export const decideApprovalStatus = (
  hasReference: boolean,
  isWholeScreen: boolean,
  score: ParityScore | undefined,
  approval: ParityApproval,
): ApprovalStatus => {
  if (!hasReference) return ApprovalStatus.NoReference;
  if (!isWholeScreen) return ApprovalStatus.NotWholeScreen;
  if (!score) return ApprovalStatus.CompareFailed;
  const value = approval.measure === ParityApprovalMeasure.Flip ? score.flip : score.meanDifference;
  return value < approval.bar ? ApprovalStatus.WithinBar : ApprovalStatus.OverBar;
};
