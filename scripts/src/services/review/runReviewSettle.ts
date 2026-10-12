import type { ReviewIssue } from "#src/models/review/ReviewIssue";
import type { ReviewSettlementDisposition } from "#src/models/review/ReviewSettlementDispositionsAnswer";

import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { ReviewSettlementOutcome } from "#src/models/review/ReviewSettlementOutcome";
import { checkIsHeldByLiveRun } from "#src/services/review/checkIsHeldByLiveRun";
import { getRunStatus } from "#src/services/review/getRunStatus";
import { checkoutQueue } from "#src/services/review/git/checkoutQueue";
import { fetchRemote } from "#src/services/review/git/fetchRemote";
import { landCommits } from "#src/services/review/git/landCommits";
import { getReviewIssueFindingLines } from "#src/services/review/issues/getReviewIssueFindingLines";
import { getReviewIssueRunId } from "#src/services/review/issues/getReviewIssueRunId";
import { renderOutcomeComment } from "#src/services/review/issues/renderOutcomeComment";
import { runGhWithBody } from "#src/services/review/issues/runGhWithBody";
import { listReviewIssues } from "#src/services/review/listReviewIssues";
import { runSettler } from "#src/services/review/runSettler";
import { writeReviewSummary } from "#src/services/review/writeReviewSummary";
import { REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGh } from "#src/services/shared/runGh";
import { runGit } from "#src/services/shared/runGit";
import { getResultAsync, takeOne } from "@esposter/shared";

// What one issue's settler produced: its dispositions, or the error that ended it
type SettleOutcome = { dispositions: ReviewSettlementDisposition[] } | { error: Error };

const countOutcome = (dispositions: ReviewSettlementDisposition[], outcome: ReviewSettlementOutcome): number =>
  dispositions.filter((disposition) => disposition.outcome === outcome).length;

// Lands the settler's commits, then closes the issue with the outcome of each finding. Commits that do not land leave the
// Issue open, so the next run settles it again from the queue's tip. Returns whether the issue closed.
const closeSettledIssue = (issue: ReviewIssue, dispositions: ReviewSettlementDisposition[]): boolean => {
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

// Settles every open review issue one at a time, oldest first. A settler's commits land before the next one starts, so
// Settlers never conflict with each other. An issue another live run owns is left to that run's own settle job. A usage
// Limit stops the loop, and every issue not yet settled stays open.
export const runReviewSettle = async (): Promise<void> => {
  fetchRemote();
  checkoutQueue();
  const currentRunId = process.env.GITHUB_RUN_ID ?? "";
  const rows = ["## Settle", "", "| Issue | Fixed | Recorded | Refuted | Result |", "| --- | --- | --- | --- | --- |"];
  let isLimited = false;
  for (const issue of listReviewIssues()) {
    if (isLimited) break;

    const issueRunId = getReviewIssueRunId(issue.body);
    if (checkIsHeldByLiveRun(issueRunId, currentRunId, getRunStatus)) {
      rows.push(`| #${issue.number} | | | | held by run ${issueRunId} |`);
      continue;
    }

    // oxlint-disable-next-line no-await-in-loop -- Settlers run one at a time, so each one lands before the next starts
    const outcome: SettleOutcome = await getResultAsync(() => runSettler(issue)).match(
      (dispositions): SettleOutcome => ({ dispositions }),
      (error): SettleOutcome => ({ error }),
    );
    if (!("dispositions" in outcome)) {
      if (outcome.error instanceof ReviewSessionLimitedError) {
        isLimited = true;
        rows.push(`| #${issue.number} | | | | limited, left open |`);
        continue;
      }
      runGhWithBody(
        ["issue", "comment", String(issue.number)],
        `The settler failed, so this issue stays open for the next run.\n\n${outcome.error.message}`,
      );
      process.exitCode = 1;
      rows.push(`| #${issue.number} | | | | failed, left open |`);
      continue;
    }

    const { dispositions } = outcome;
    const result = closeSettledIssue(issue, dispositions) ? "closed" : "left open";
    rows.push(
      `| #${issue.number} | ${countOutcome(dispositions, ReviewSettlementOutcome.Fixed)} | ${countOutcome(dispositions, ReviewSettlementOutcome.Recorded)} | ${countOutcome(dispositions, ReviewSettlementOutcome.Refuted)} | ${result} |`,
    );
  }
  if (isLimited)
    rows.push("", "Claude's usage limit stopped the settle job, so every issue not yet settled stays open.");
  writeReviewSummary(rows);
};
