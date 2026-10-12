import type { ReviewFinding } from "#src/models/review/ReviewFinding";
import type { ReviewWindowFindings } from "#src/models/review/ReviewWindowFindings";

import { ReviewOutcome } from "#src/models/review/ReviewOutcome";
import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { createDeferredIssue } from "#src/services/review/createDeferredIssue";
import { fetchRemote } from "#src/services/review/git/fetchRemote";
import { landCommits } from "#src/services/review/git/landCommits";
import { resolveDispositions } from "#src/services/review/resolveDispositions";
import { runFixer } from "#src/services/review/runFixer";
import { writeReviewSummary } from "#src/services/review/writeReviewSummary";
import { REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResultAsync, takeOne } from "@esposter/shared";

// A table cell's `|` would end the cell early
const toCell = (text: string): string => text.replaceAll("|", String.raw`\|`);

const getFindingRow = (finding: ReviewFinding, outcome: ReviewOutcome): string =>
  `| \`${finding.file}:${finding.line}\` | ${finding.lane} | ${outcome} | ${toCell(finding.summary)} |`;

// The fixer over one passed window's findings, in this checkout at the queue's tip. Its commits land on `ai/queue`; what
// It did not fix, or whose commit did not land, is deferred to the one issue for the window. Each step's failure is handled
// Where it stands, and the summary says what happened.
export const runReviewFix = async ({ base, end, findings }: ReviewWindowFindings): Promise<void> => {
  const summary = [`## Fix ${base.slice(0, 12)}..${end.slice(0, 12)}`, "", `${findings.length} finding(s) to fix.`];
  fetchRemote();
  const fixer = await getResultAsync(() => runFixer(base, end, findings)).match(
    (dispositions) => ({ dispositions, failureReason: "", isLimited: false }),
    (error) =>
      error instanceof ReviewSessionLimitedError
        ? { dispositions: undefined, failureReason: "the fixer was limited by Claude's usage limit", isLimited: true }
        : { dispositions: undefined, failureReason: `the fixer failed: ${error.message}`, isLimited: false },
  );

  const isAhead = runGit(["rev-list", "--count", `${REMOTE_QUEUE_REF}..HEAD`]).trim() !== "0";
  const isLanded = isAhead ? landCommits() : true;
  const dispositions = resolveDispositions(findings.length, fixer.dispositions, fixer.failureReason);
  // A fix whose commit never reached the queue is not a fix
  if (!isLanded)
    for (const disposition of dispositions)
      if (disposition.outcome === ReviewOutcome.Fixed)
        Object.assign(disposition, { outcome: ReviewOutcome.Deferred, reason: "its commit did not land on ai/queue" });

  summary.push("", "| Finding | Lane | Outcome | Summary |", "| --- | --- | --- | --- |");
  for (const disposition of dispositions)
    summary.push(getFindingRow(takeOne(findings, disposition.index), disposition.outcome));

  const deferred = dispositions
    .filter(({ outcome }) => outcome === ReviewOutcome.Deferred)
    .map((disposition) => ({ disposition, finding: takeOne(findings, disposition.index) }));
  if (deferred.length > 0) {
    const issueUrl = createDeferredIssue(deferred, base, end);
    summary.push("", `Deferred findings: ${issueUrl}`);
  }
  if (fixer.isLimited) summary.push("", "The fixer was limited, so its findings were deferred.");
  writeReviewSummary(summary);
};
