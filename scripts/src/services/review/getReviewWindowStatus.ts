import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";

import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";

// A window passed when every batch answered. A batch that hit the usage limit makes it limited, which outranks any other
// Batch's error, and any other error makes it failed.
export const getReviewWindowStatus = (outcomes: ReviewBatchOutcome[]): ReviewWindowStatus => {
  const errors = outcomes.flatMap((outcome) => ("error" in outcome ? [outcome.error] : []));
  if (errors.some((error) => error instanceof ReviewSessionLimitedError)) return ReviewWindowStatus.Limited;
  return errors.length > 0 ? ReviewWindowStatus.Failed : ReviewWindowStatus.Passed;
};
