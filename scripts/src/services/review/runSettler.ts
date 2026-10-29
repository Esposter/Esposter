import type { ReviewIssue } from "#src/models/review/ReviewIssue";
import type { ReviewSettlementDisposition } from "#src/models/review/ReviewSettlementDisposition";

import { ReviewSessionRole } from "#src/models/review/ReviewSessionRole";
import { reviewSettlementDispositionsAnswerSchema } from "#src/models/review/ReviewSettlementDispositionsAnswer";
import { checkIsSettlementComplete } from "#src/services/review/checkIsSettlementComplete";
import { SETTLER_TIMEOUT_MS } from "#src/services/review/constants";
import { getSettlerPrompt } from "#src/services/review/getSettlerPrompt";
import { getReviewIssueFindingLines } from "#src/services/review/issues/getReviewIssueFindingLines";
import { parseReviewAnswer } from "#src/services/review/parseReviewAnswer";
import { runSession } from "#src/services/review/runSession";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The settler session for one review issue, in this checkout at the queue's tip. It is not retried, and an answer that
// Leaves a finding out fails the issue, which stays open for the next run.
export const runSettler = async (issue: ReviewIssue): Promise<ReviewSettlementDisposition[]> => {
  const output = await runSession({
    cwd: REPOSITORY_ROOT,
    prompt: getSettlerPrompt(issue),
    role: ReviewSessionRole.Settler,
    timeoutMs: SETTLER_TIMEOUT_MS,
  });
  const { dispositions } = parseReviewAnswer(output, reviewSettlementDispositionsAnswerSchema);
  const findingCount = getReviewIssueFindingLines(issue.body).length;
  if (!checkIsSettlementComplete(findingCount, dispositions))
    throw new InvalidOperationError(
      Operation.Read,
      "settlement",
      `it does not answer each of the ${findingCount} finding(s) by its index`,
    );

  return dispositions;
};
