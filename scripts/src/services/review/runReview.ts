import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";
import type { ReviewFinding } from "#src/models/review/ReviewFinding";
import type { ReviewRange } from "#src/models/review/ReviewRange";
import type { ReviewWindow } from "#src/models/review/ReviewWindow";

import { ReviewMode } from "#src/models/review/ReviewMode";
import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";
import { checkIsBacklogOwed } from "#src/services/review/checkIsBacklogOwed";
import { REVIEW_FIX_MATRIX_CAP, REVIEW_ISSUE_LABEL, REVIEW_RUN_DEADLINE } from "#src/services/review/constants";
import { dispatchReview } from "#src/services/review/dispatchReview";
import { formatReviewWindow } from "#src/services/review/formatReviewWindow";
import { getNewlyPassedWindowIndices } from "#src/services/review/getNewlyPassedWindowIndices";
import { getPassedWindowCount } from "#src/services/review/getPassedWindowCount";
import { getReviewWindowStatus } from "#src/services/review/getReviewWindowStatus";
import { advanceMain } from "#src/services/review/git/advanceMain";
import { assertCheckoutIsDisposable } from "#src/services/review/git/assertCheckoutIsDisposable";
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
  if (!isDryRun) {
    assertCheckoutIsDisposable();
    checkoutQueue();
  }
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

  // Opens a window's findings as issues, and returns whether every one opened. A window with none has nothing to open.
  const openIssuesFor = (index: number): boolean => {
    const { base, end } = takeOne(windows, index);
    const findings = takeOne(findingsByWindow, index);
    if (findings.length === 0) return true;

    return getResult(() => openReviewIssues(base, end, findings, runId)).match(
      (opened) => {
        for (const issue of opened) {
          issueNumbers.push(issue.issue);
          if (findingsDirectory !== "") writeReviewIssueFindings(findingsDirectory, issue);
        }
        return true;
      },
      (error) => {
        const line = `window ${index}: ${findings.length} finding(s) did not open an issue: ${error.message}`;
        console.error(line);
        issueErrors.push(line);
        return false;
      },
    );
  };

  // The one place the run acts on windows, called as each window settles. The pool's callbacks are synchronous, so the
  // Issues and advances run one at a time in window order without a queue of their own. A window's issues open before
  // `main` moves past it, so a finding is never left only in a run's memory: a window whose issues did not open stops the
  // Run's advances there, and the next run reviews it again.
  const advancePassedWindows = (): void => {
    if (isStopped) return;
    let lastOpenedIndex = -1;
    for (const index of getNewlyPassedWindowIndices(statuses, handledCount)) {
      if (!openIssuesFor(index)) {
        isStopped = true;
        break;
      }
      lastOpenedIndex = index;
    }
    if (lastOpenedIndex === -1) return;

    handledCount = lastOpenedIndex + 1;
    if (mode !== ReviewMode.Steady) return;

    const { end } = takeOne(windows, lastOpenedIndex);
    if (advanceMain(end)) {
      mainNotices.push(`${MAIN_BRANCH} advanced to ${end.slice(0, 12)}.`);
      return;
    }
    mainNotices.push(
      `${MAIN_BRANCH} was not advanced, because it moved meanwhile. The next run reviews these windows again, and may raise the findings of their issues again.`,
    );
    isStopped = true;
  };

  // A window with no batch has nothing to read, so it settles at once as a pass, which the callback handles
  await reviewWindows(windows, deadline, (index, outcomes) => {
    statuses[index] = getReviewWindowStatus(outcomes);
    findingsByWindow[index] = getFindings(outcomes);
    // Logged as well as summarized, since a job's summary is not readable through GitHub's API and its log is
    for (const outcome of outcomes) {
      if (!("error" in outcome)) continue;
      const line = `window ${index}: ${outcome.error.message}`;
      console.error(line);
      batchErrors.push(`- ${line}`);
    }
    advancePassedWindows();
  });

  // Every window settles by the pool's end, and a window that somehow did not was not read, so it is unreached
  const settled = statuses.map((status) => status ?? ReviewWindowStatus.Unreached);
  const passedCount = getPassedWindowCount(settled);
  const isBacklogOwed = mode === ReviewMode.Steady && checkIsBacklogOwed(settled);
  if (isBacklogOwed)
    getResult(dispatchReview).match(noop, (error) => {
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
    // The window that ends the prefix never passed, so it failed unless the limit or the deadline stopped it
    const blockingStatus = takeOne(settled, passedCount);
    const cause =
      blockingStatus === ReviewWindowStatus.Limited
        ? `Claude's usage limit stopped window ${passedCount}`
        : blockingStatus === ReviewWindowStatus.Unreached
          ? `the deadline left window ${passedCount} unreviewed`
          : `window ${passedCount} did not pass`;
    summary.push("", `${cause}, so the windows after it did not pass.${resume}`);
  }
  summary.push(...batchErrors, ...issueErrors.map((error) => `- ${error}`));
  writeReviewSummary(summary);

  // Set after the outputs and files are written, so the run shows red while the passed prefix still advanced and its
  // Issues still open
  if (settled.includes(ReviewWindowStatus.Failed) || issueErrors.length > 0) process.exitCode = 1;
};
