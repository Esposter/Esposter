import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";
import type { ReviewFile } from "#src/models/review/ReviewFile";
import type { ReviewFinding } from "#src/models/review/ReviewFinding";

import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { ReviewSessionRole } from "#src/models/review/ReviewSessionRole";
import { reviewFindingsAnswerSchema } from "#src/models/review/ReviewFindingsAnswer";
import { REVIEWER_TIMEOUT_MS } from "#src/services/review/constants";
import { getReviewerPrompt } from "#src/services/review/getReviewerPrompt";
import { parseReviewAnswer } from "#src/services/review/parseReviewAnswer";
import { readBatchDiff } from "#src/services/review/readBatchDiff";
import { runSession } from "#src/services/review/runSession";
import { runGit } from "#src/services/shared/runGit";
import { getResultAsync } from "@esposter/shared";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Asks a reviewer once more when its first answer fails, since a failure is most often a launch or a read that a second
// attempt clears. A usage limit is not retried: the second attempt would meet the same limit.
const askWithRetry = async (ask: () => Promise<ReviewFinding[]>): Promise<ReviewFinding[]> => {
  const first = await getResultAsync(ask).match(
    (findings): { findings: ReviewFinding[] } | { error: Error } => ({ findings }),
    (error) => ({ error }),
  );
  if ("findings" in first) return first.findings;
  if (first.error instanceof ReviewSessionLimitedError) throw first.error;

  return ask();
};

// One reviewer over one batch, read-only, in a detached worktree at `end` that is removed once the reviewer answers. It
// reports an outcome rather than throwing, so one batch's failure does not end the others' reviews mid-flight.
export const reviewBatch = async (base: string, end: string, files: ReviewFile[]): Promise<ReviewBatchOutcome> => {
  const { diff, isDiffCut } = readBatchDiff(
    base,
    end,
    files.map(({ path }) => path),
  );
  const prompt = getReviewerPrompt({ base, diff, end, files: files.map(({ path }) => path), isDiffCut });
  const directory = join(tmpdir(), `esposter-review-${randomUUID()}`);
  runGit(["worktree", "add", "--detach", directory, end]);

  const outcome = await getResultAsync(() =>
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
  runGit(["worktree", "remove", "--force", directory]);
  return outcome;
};
