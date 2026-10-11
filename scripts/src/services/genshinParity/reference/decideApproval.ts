import type { ParityScore } from "#src/models/genshinParity/reference/ParityScore";

import { ApprovalOutcome } from "#src/models/genshinParity/reference/ApprovalOutcome";

// An image is approved only by a compare against a reference on disk that scores under the bar, and that judges the
// Whole screen: a region compare leaves the rest of the image unjudged, and a reference shot in other props judges another
// State than the base image draws; a missing reference and a failed compare each
// Have no score to judge, and a score at the bar is not under it
export const decideApproval = (
  hasReference: boolean,
  isWholeScreen: boolean,
  score: ParityScore | undefined,
  bar: number,
): ApprovalOutcome => {
  if (!hasReference) return ApprovalOutcome.NoReference;
  if (!isWholeScreen) return ApprovalOutcome.NotWholeScreen;
  if (!score) return ApprovalOutcome.CompareFailed;
  return score.flip < bar ? ApprovalOutcome.Approved : ApprovalOutcome.OverBar;
};
