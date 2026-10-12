import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";

import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";

// A window passed when every batch answered. A batch that hit the usage limit makes it limited, which outranks any other
// Batch's error, and any other error makes it failed. A batch the deadline left unstarted makes it unreached, which only
// Outranks a pass: a window with an error is failed, since a rerun would meet the same error.
export const getReviewWindowStatus = (outcomes: ReviewBatchOutcome[]): ReviewWindowStatus => {
  const errors = outcomes.flatMap((outcome) => ("error" in outcome ? [outcome.error] : []));
  if (errors.some((error) => error instanceof ReviewSessionLimitedError)) return ReviewWindowStatus.Limited;
  if (errors.length > 0) return ReviewWindowStatus.Failed;

  return outcomes.some((outcome) => "isUnreached" in outcome)
    ? ReviewWindowStatus.Unreached
    : ReviewWindowStatus.Passed;
};
