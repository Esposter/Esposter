import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";
import type { ReviewFinding } from "#src/models/review/ReviewFinding";
import type { ReviewRange } from "#src/models/review/ReviewRange";
import type { ReviewWindow } from "#src/models/review/ReviewWindow";

import { ReviewMode } from "#src/models/review/ReviewMode";
import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";
import { checkIsBacklogOwed } from "#src/services/review/checkIsBacklogOwed";
import { REVIEW_FIX_MATRIX_CAP, REVIEW_ISSUE_LABEL, REVIEW_RUN_DEADLINE } from "#src/services/review/constants";
import { formatReviewWindow } from "#src/services/review/formatReviewWindow";
import { getNewlyPassedWindowIndices } from "#src/services/review/getNewlyPassedWindowIndices";
import { getPassedWindowCount } from "#src/services/review/getPassedWindowCount";
import { getReviewWindowStatus } from "#src/services/review/getReviewWindowStatus";
import { advanceMain } from "#src/services/review/git/advanceMain";
import { checkoutQueue } from "#src/services/review/git/checkoutQueue";
import { fetchRemote } from "#src/services/review/git/fetchRemote";
import { mergeMain } from "#src/services/review/git/mergeMain";
import { openReviewIssues } from "#src/services/review/issues/openReviewIssues";
import { readReviewWindows } from "#src/services/review/readReviewWindows";
import { reviewWindows } from "#src/services/review/reviewWindows";
import { writeFixIssues } from "#src/services/review/writeFixIssues";
import { writeReviewIssueFindings } from "#src/services/review/writeReviewIssueFindings";
import { writeReviewSummary } from "#src/services/review/writeReviewSummary";
import { MAIN_BRANCH, QUEUE_BRANCH, REMOTE_MAIN_REF, REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGh } from "#src/services/shared/runGh";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, noop, Operation, takeOne } from "@esposter/shared";

export interface ReviewRunInput {
  findingsDirectory: string;
  from: string;
  isDryRun: boolean;
  to: string;
}

const getMode = (from: string, to: string): ReviewMode => {
  if (from === "" && to === "") return ReviewMode.Steady;
  if (from === "" || to === "")
    throw new InvalidOperationError(Operation.Read, "review range", "it takes both --from and --to");
  return ReviewMode.Range;
};

const checkIsMainAncestor = (): boolean =>
  getResult(() => runGit(["merge-base", "--is-ancestor", REMOTE_MAIN_REF, REMOTE_QUEUE_REF])).match(
    () => true,
    () => false,
  );

const getFindings = (outcomes: ReviewBatchOutcome[]): ReviewFinding[] =>
  outcomes.flatMap((outcome) => ("findings" in outcome ? outcome.findings : []));

// One window as a row of the summary's table
const getWindowRow = (
  { base, batches, end }: ReviewWindow,
  index: number,
  findingCount: number,
  status: ReviewWindowStatus,
): string =>
  `| ${index} | \`${base.slice(0, 12)}..${end.slice(0, 12)}\` | ${batches.length} | ${findingCount} | ${status} |`;

// Plans every window owed, reviews all of their batches in one pool, and acts on each window as it joins the passed prefix:
// In steady mode `main` advances to the prefix's end, then the window's findings open their issues. A window that did not
// Pass stops the prefix, so `main` never moves past a window no review read in full. A deadline leaves the windows past it
// For the next run, which the run dispatches once when nothing else stopped it.
export const runReview = async ({ findingsDirectory, from, isDryRun, to }: ReviewRunInput): Promise<void> => {
  const mode = getMode(from, to);
  fetchRemote();
  if (!isDryRun) checkoutQueue();
  const range: ReviewRange =
    mode === ReviewMode.Steady
      ? { from: REMOTE_MAIN_REF, mode, to: REMOTE_QUEUE_REF }
      : {
          from: runGit(["rev-parse", "--verify", `${from}^{commit}`]).trim(),
          mode,
          to: runGit(["rev-parse", "--verify", `${to}^{commit}`]).trim(),
        };

  // `main` pushed by hand past the queue is merged in first, and that push starts the next run
  if (mode === ReviewMode.Steady && !checkIsMainAncestor()) {
    if (isDryRun) {
      console.info(`${MAIN_BRANCH} has diverged from ${QUEUE_BRANCH}: a run merges ${REMOTE_MAIN_REF} into it first`);
      return;
    }
    mergeMain();
    runGit(["push", "origin", `HEAD:${QUEUE_BRANCH}`]);
    writeFixIssues([]);
    writeReviewSummary([`${REMOTE_MAIN_REF} was merged into ${QUEUE_BRANCH}, and that push starts the next run.`]);
    return;
  }

  const windows = readReviewWindows(range);
  if (windows.length === 0) {
    console.info("nothing owed");
    writeFixIssues([]);
    return;
  }
  console.info(`${windows.length} window(s) owed`);
  for (const [index, window] of windows.entries()) console.info(formatReviewWindow(window, index));
  if (isDryRun) return;

  const deadline = Date.now() + REVIEW_RUN_DEADLINE.total("milliseconds");
  const runId = process.env.GITHUB_RUN_ID ?? "";
  // A window's status and findings are set when its last batch lands, and the prefix only ever reads settled windows
  const statuses: (ReviewWindowStatus | undefined)[] = windows.map(() => undefined);
  const findingsByWindow: ReviewFinding[][] = windows.map(() => []);
  const issueNumbers: number[] = [];
  const mainNotices: string[] = [];
  const batchErrors: string[] = [];
  const issueErrors: string[] = [];
  let handledCount = 0;
  // Set once `main` refused a push: the windows then may be stale, so no further advance or issue happens in this run
  let isStopped = false;

  const openIssuesFor = (index: number): void => {
    const { base, end } = takeOne(windows, index);
    const findings = takeOne(findingsByWindow, index);
    if (findings.length === 0) return;

    const opened = getResult(() => openReviewIssues(base, end, findings, runId)).match(
      (issues) => issues,
      (error) => {
        issueErrors.push(`window ${index}: ${findings.length} finding(s) did not open an issue: ${error.message}`);
        return [];
      },
    );
    for (const issue of opened) {
      issueNumbers.push(issue.issue);
      if (findingsDirectory !== "") writeReviewIssueFindings(findingsDirectory, issue);
    }
  };

  // The one place the run acts on windows, called as each window settles. The pool's callbacks are synchronous, so the
  // Advances and issues run one at a time in window order without a queue of their own.
  const advancePassedWindows = (): void => {
    if (isStopped) return;
    const indices = getNewlyPassedWindowIndices(statuses, handledCount);
    if (indices.length === 0) return;

    const { end } = takeOne(windows, takeOne(indices, indices.length - 1));
    if (mode === ReviewMode.Steady) {
      const isMainMoved = advanceMain(end);
      if (!isMainMoved) {
        mainNotices.push(
          `${MAIN_BRANCH} was not advanced, because it moved meanwhile. The next run re-measures, and no fixer runs on these windows.`,
        );
        isStopped = true;
        return;
      }
      mainNotices.push(`${MAIN_BRANCH} advanced to ${end.slice(0, 12)}.`);
    }
    handledCount += indices.length;
    for (const index of indices) openIssuesFor(index);
  };

  // A window with no batch has nothing to read, so it settles at once as a pass, which the callback handles
  await reviewWindows(windows, deadline, (index, outcomes) => {
    statuses[index] = getReviewWindowStatus(outcomes);
    findingsByWindow[index] = getFindings(outcomes);
    for (const outcome of outcomes)
      if ("error" in outcome) batchErrors.push(`- window ${index}: ${outcome.error.message}`);
    advancePassedWindows();
  });

  // Every window settles by the pool's end, and a window that somehow did not was not read, so it is unreached
  const settled = statuses.map((status) => status ?? ReviewWindowStatus.Unreached);
  const passedCount = getPassedWindowCount(settled);
  const isBacklogOwed = mode === ReviewMode.Steady && checkIsBacklogOwed(settled);
  if (isBacklogOwed)
    getResult(() => runGh(["workflow", "run", "Review.yaml", "--ref", QUEUE_BRANCH])).match(noop, (error) => {
      issueErrors.push(`the next run was not dispatched: ${error.message}`);
    });
  writeFixIssues(issueNumbers.slice(0, REVIEW_FIX_MATRIX_CAP));

  const summary = [
    "## Review",
    "",
    "| Window | Range | Batches | Findings | Status |",
    "| --- | --- | --- | --- | --- |",
    ...windows.map((window, index) =>
      getWindowRow(window, index, takeOne(findingsByWindow, index).length, takeOne(settled, index)),
    ),
    "",
  ];
  if (mode === ReviewMode.Range) summary.push(`A range review never moves ${MAIN_BRANCH}.`);
  else if (mainNotices.length === 0) summary.push(`${MAIN_BRANCH} did not move, because no window passed.`);
  else summary.push(...mainNotices);
  summary.push(
    issueNumbers.length > 0
      ? `${issueNumbers.length} review issue(s) opened: ${issueNumbers.map((issue) => `#${issue}`).join(", ")}.`
      : "No review issue opened.",
  );
  if (issueNumbers.length > REVIEW_FIX_MATRIX_CAP)
    summary.push(
      `${issueNumbers.length - REVIEW_FIX_MATRIX_CAP} issue(s) past the fix matrix's cap of ${REVIEW_FIX_MATRIX_CAP} stay open for the settle job, labelled \`${REVIEW_ISSUE_LABEL}\`.`,
    );
  if (isBacklogOwed) summary.push("The deadline left windows unreviewed, so the next run is dispatched.");
  // The first window that did not pass ends the prefix, and in range mode its base is where a resume starts
  if (passedCount < windows.length) {
    const { base } = takeOne(windows, passedCount);
    const resume = mode === ReviewMode.Range ? ` Resume with \`from=${base}\`.` : "";
    const cause = {
      [ReviewWindowStatus.Failed]: `window ${passedCount} did not pass`,
      [ReviewWindowStatus.Limited]: `Claude's usage limit stopped window ${passedCount}`,
      [ReviewWindowStatus.Passed]: `window ${passedCount} did not pass`,
      [ReviewWindowStatus.Unreached]: `the deadline left window ${passedCount} unreviewed`,
    }[takeOne(settled, passedCount)];
    summary.push("", `${cause}, so the windows after it did not pass.${resume}`);
  }
  summary.push(...batchErrors, ...issueErrors.map((error) => `- ${error}`));
  writeReviewSummary(summary);

  // Set after the outputs and files are written, so the run shows red while the passed prefix still advanced and its
  // Issues still open
  if (settled.includes(ReviewWindowStatus.Failed) || issueErrors.length > 0) process.exitCode = 1;
};
