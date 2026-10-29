import type { ReviewIssue } from "#src/models/review/ReviewIssue";
import type { ReviewSettlementDisposition } from "#src/models/review/ReviewSettlementDisposition";

import { landCommits } from "#src/services/review/git/landCommits";
import { getReviewIssueFindingLines } from "#src/services/review/issues/getReviewIssueFindingLines";
import { renderOutcomeComment } from "#src/services/review/issues/renderOutcomeComment";
import { runGhWithBody } from "#src/services/review/issues/runGhWithBody";
import { REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGh } from "#src/services/shared/runGh";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// Lands the settler's commits, then closes the issue with the outcome of each finding. Commits that do not land leave the
// Issue open, so the next run settles it again from the queue's tip. Returns whether the issue closed.
export const closeSettledIssue = (issue: ReviewIssue, dispositions: ReviewSettlementDisposition[]): boolean => {
  const lines = getReviewIssueFindingLines(issue.body);
  const isAhead = runGit(["rev-list", "--count", `${REMOTE_QUEUE_REF}..HEAD`]).trim() !== "0";
  if (isAhead && !landCommits()) {
    runGhWithBody(
      ["issue", "comment", String(issue.number)],
      "The settler's commits did not land on ai/queue, so this issue stays open for the next run.",
    );
    return false;
  }

  const rows = dispositions.map((disposition) => ({
    finding: takeOne(lines, disposition.index),
    outcome: disposition.outcome,
    reason: disposition.reason,
  }));
  runGhWithBody(
    ["issue", "comment", String(issue.number)],
    renderOutcomeComment("The settle job settled every finding of this issue.", rows),
  );
  runGh(["issue", "close", String(issue.number)]);
  return true;
};
