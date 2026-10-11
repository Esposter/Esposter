import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";
import type { ParityApproval } from "#src/models/genshinParity/shared/ParityApproval";

import { ApprovalOutcome } from "#src/models/genshinParity/reference/ApprovalOutcome";
import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";

// An image is approved only by a compare against a reference on disk that scores under the screen's own bar, on the
// Measure it records, and that judges the whole screen: a region compare leaves the rest of the image unjudged, and a
// Reference shot in other props judges another state than the base image draws; a missing reference and a failed
// Compare each have no score to judge, and a score at the bar is not under it
export const decideApproval = (
  hasReference: boolean,
  isWholeScreen: boolean,
  score: ParityScore | undefined,
  approval: ParityApproval,
): ApprovalOutcome => {
  if (!hasReference) return ApprovalOutcome.NoReference;
  if (!isWholeScreen) return ApprovalOutcome.NotWholeScreen;
  if (!score) return ApprovalOutcome.CompareFailed;
  const value = approval.measure === ParityApprovalMeasure.Flip ? score.flip : score.meanDifference;
  return value < approval.bar ? ApprovalOutcome.Approved : ApprovalOutcome.OverBar;
};
