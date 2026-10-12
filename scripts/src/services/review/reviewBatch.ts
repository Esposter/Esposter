import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";
import type { ReviewFile } from "#src/models/review/ReviewFile";
import type { ReviewFinding } from "#src/models/review/ReviewFinding";

import { reviewFindingsAnswerSchema } from "#src/models/review/ReviewFindingsAnswer";
import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { ReviewSessionRole } from "#src/models/review/ReviewSessionRole";
import { REVIEWER_TIMEOUT_MS } from "#src/services/review/constants";
import { getReviewerPrompt } from "#src/services/review/getReviewerPrompt";
import { parseReviewAnswer } from "#src/services/review/parseReviewAnswer";
import { readBatchDiff } from "#src/services/review/readBatchDiff";
import { runSession } from "#src/services/review/runSession";
import { getResultAsync } from "@esposter/shared";

// Asks a reviewer once more when its first answer fails, since a failure is most often a launch or a read that a second
// Attempt clears. A usage limit is not retried: the second attempt would meet the same limit.
const askWithRetry = async (ask: () => Promise<ReviewFinding[]>): Promise<ReviewFinding[]> => {
  const first = await getResultAsync(ask).match(
    (findings): { error: Error } | { findings: ReviewFinding[] } => ({ findings }),
    (error) => ({ error }),
  );
  if ("findings" in first) return first.findings;
  if (first.error instanceof ReviewSessionLimitedError) throw first.error;

  return ask();
};

// One reviewer over one batch, read-only, in its window's worktree at `directory`, which the caller creates and removes.
// It reports an outcome rather than throwing, so one batch's failure does not end the others' reviews mid-flight.
export const reviewBatch = (
  directory: string,
  base: string,
  end: string,
  files: ReviewFile[],
): Promise<ReviewBatchOutcome> => {
  const { diff, isDiffCut } = readBatchDiff(
    base,
    end,
    files.map(({ path }) => path),
  );
  const prompt = getReviewerPrompt({ base, diff, end, files: files.map(({ path }) => path), isDiffCut });

  return getResultAsync(() =>
    askWithRetry(async () => {
      const output = await runSession({
        cwd: directory,
        prompt,
        role: ReviewSessionRole.Reviewer,
        timeoutMs: REVIEWER_TIMEOUT_MS,
      });
      return parseReviewAnswer(output, reviewFindingsAnswerSchema).findings;
    }),
  ).match(
    (findings): ReviewBatchOutcome => ({ findings }),
    (error): ReviewBatchOutcome => ({ error }),
  );
};
