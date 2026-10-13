import type { ReviewIssue } from "#src/models/review/ReviewIssue";
import type { ReviewSettlementDisposition } from "#src/models/review/ReviewSettlementDispositionsAnswer";

import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { ReviewSettlementOutcome } from "#src/models/review/ReviewSettlementOutcome";
import { checkIsHeldByLiveRun } from "#src/services/review/checkIsHeldByLiveRun";
import { REVIEW_SETTLE_DEADLINE } from "#src/services/review/constants";
import { dispatchReview } from "#src/services/review/dispatchReview";
import { getRunJobs } from "#src/services/review/getRunJobs";
import { assertCheckoutIsDisposable } from "#src/services/review/git/assertCheckoutIsDisposable";
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
import { getResult, getResultAsync, takeOne } from "@esposter/shared";

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

// Settles every open review issue one at a time, oldest first. Each settler starts clean on the queue's latest tip, and
// Its commits land before the next one starts, so settlers never conflict with each other. An issue a fixer may still be
// On is left for a later settle job. A usage limit stops the loop, and every issue not yet settled stays open for the next
// Push's run. The deadline stops it too, and then the run dispatches the next one, since no push may follow.
export const runReviewSettle = async (): Promise<void> => {
  const deadline = Date.now() + REVIEW_SETTLE_DEADLINE.total("milliseconds");
  const currentRunId = process.env.GITHUB_RUN_ID ?? "";
  const rows = ["## Settle", "", "| Issue | Fixed | Recorded | Refuted | Result |", "| --- | --- | --- | --- | --- |"];
  let isLimited = false;
  let isPastDeadline = false;
  fetchRemote();
  assertCheckoutIsDisposable();
  for (const issue of listReviewIssues()) {
    if (isLimited) break;
    if (Date.now() >= deadline) {
      isPastDeadline = true;
      break;
    }

    const issueRunId = getReviewIssueRunId(issue.body);
    if (checkIsHeldByLiveRun(issue.number, issueRunId, currentRunId, getRunJobs)) {
      rows.push(`| #${issue.number} | | | | held by run ${issueRunId} |`);
      continue;
    }

    fetchRemote();
    checkoutQueue();

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
  if (isPastDeadline)
    rows.push(
      "",
      getResult(dispatchReview).match(
        () => "The deadline stopped the settle job, so the next run is dispatched for the issues left open.",
        (error) => {
          process.exitCode = 1;
          return `The deadline stopped the settle job, and the next run was not dispatched: ${error.message}`;
        },
      ),
    );
  writeReviewSummary(rows);
};
