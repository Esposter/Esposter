import type { ReviewIssueFindings } from "#src/models/review/ReviewIssueFindings";

import { ReviewOutcome } from "#src/models/review/ReviewOutcome";
import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { fetchRemote } from "#src/services/review/git/fetchRemote";
import { landCommits } from "#src/services/review/git/landCommits";
import { formatReviewFinding } from "#src/services/review/issues/formatReviewFinding";
import { renderOutcomeComment } from "#src/services/review/issues/renderOutcomeComment";
import { renderOutcomeTable } from "#src/services/review/issues/renderOutcomeTable";
import { renderReviewIssueBody } from "#src/services/review/issues/renderReviewIssueBody";
import { runGhWithBody } from "#src/services/review/issues/runGhWithBody";
import { resolveDispositions } from "#src/services/review/resolveDispositions";
import { runFixer } from "#src/services/review/runFixer";
import { writeReviewSummary } from "#src/services/review/writeReviewSummary";
import { REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGh } from "#src/services/shared/runGh";
import { runGit } from "#src/services/shared/runGit";
import { getResultAsync, takeOne } from "@esposter/shared";

// The fixer over one review issue's findings, in this checkout at the queue's tip. Its commits land on `ai/queue`. The issue
// Is then narrowed to what stays open, or closed when every finding settled. A fixer that is never answered, or whose
// Commit did not land, leaves its findings on the issue, which the settle job takes.
export const runReviewFix = async ({ base, end, findings, issue }: ReviewIssueFindings): Promise<void> => {
  const summary = [`## Fix issue #${issue}`, "", `${findings.length} finding(s) to fix.`];
  fetchRemote();
  const fixer = await getResultAsync(() => runFixer(base, end, findings)).match(
    (dispositions) => ({ dispositions, failureReason: "", isLimited: false }),
    (error) =>
      error instanceof ReviewSessionLimitedError
        ? { dispositions: undefined, failureReason: "the fixer was limited by Claude's usage limit", isLimited: true }
        : { dispositions: undefined, failureReason: `the fixer failed: ${error.message}`, isLimited: false },
  );

  const isAhead = runGit(["rev-list", "--count", `${REMOTE_QUEUE_REF}..HEAD`]).trim() !== "0";
  // Nothing ahead of the queue means the fixer committed nothing, so no fix it claims has landed
  const isLanded = isAhead && landCommits();
  const dispositions = resolveDispositions(findings.length, fixer.dispositions, fixer.failureReason);
  // A fix whose commit never reached the queue is not a fix
  if (!isLanded)
    for (const disposition of dispositions)
      if (disposition.outcome === ReviewOutcome.Fixed)
        Object.assign(disposition, { outcome: ReviewOutcome.Deferred, reason: "its commit did not land on ai/queue" });

  const rows = dispositions.map((disposition) => ({
    finding: formatReviewFinding(takeOne(findings, disposition.index)),
    outcome: disposition.outcome,
    reason: disposition.reason,
  }));
  summary.push("", renderOutcomeTable(rows));

  const openFindings = dispositions
    .filter(({ outcome }) => outcome === ReviewOutcome.Deferred)
    .map(({ index, reason }) => ({ finding: takeOne(findings, index), reason }));
  if (openFindings.length === 0) {
    runGhWithBody(
      ["issue", "comment", String(issue)],
      renderOutcomeComment("The review's fix settled every finding.", rows),
    );
    runGh(["issue", "close", String(issue)]);
    summary.push("", `Issue #${issue} closed.`);
  } else {
    const settledRows = rows.filter(({ outcome }) => outcome !== ReviewOutcome.Deferred);
    if (settledRows.length > 0)
      runGhWithBody(
        ["issue", "comment", String(issue)],
        renderOutcomeComment(
          "The review's fix settled these findings. The rest stay on this issue for the settle job.",
          settledRows,
        ),
      );
    runGhWithBody(
      ["issue", "edit", String(issue)],
      renderReviewIssueBody({ base, end, items: openFindings, runId: process.env.GITHUB_RUN_ID ?? "" }),
    );
    summary.push("", `Issue #${issue} left open with ${openFindings.length} finding(s).`);
  }
  if (fixer.isLimited) summary.push("", "The fixer was limited, so its findings stay open for the settle job.");
  writeReviewSummary(summary);
};
