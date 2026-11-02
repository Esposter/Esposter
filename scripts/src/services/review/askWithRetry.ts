import type { ReviewFinding } from "#src/models/review/ReviewFinding";

import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { getResultAsync } from "@esposter/shared";

// Asks a reviewer once more when its first answer fails, since a failure is most often a launch or a read that a second
// Attempt clears. A usage limit is not retried: the second attempt would meet the same limit.
export const askWithRetry = async (ask: () => Promise<ReviewFinding[]>): Promise<ReviewFinding[]> => {
  const first = await getResultAsync(ask).match(
    (findings): { error: Error } | { findings: ReviewFinding[] } => ({ findings }),
    (error) => ({ error }),
  );
  if ("findings" in first) return first.findings;
  if (first.error instanceof ReviewSessionLimitedError) throw first.error;

  // Logged before the retry, so a retry that succeeds still leaves the failure it recovered from in the job's log
  console.error(`a reviewer's first attempt failed, so it is asked again: ${first.error.message}`);
  return ask();
};
