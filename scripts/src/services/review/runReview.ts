import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";
import type { ReviewFinding } from "#src/models/review/ReviewFinding";
import type { ReviewRange } from "#src/models/review/ReviewRange";

import { ReviewMode } from "#src/models/review/ReviewMode";
import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";
import { REVIEW_RUN_WINDOW_CAP } from "#src/services/review/constants";
import { formatReviewWindow } from "#src/services/review/formatReviewWindow";
import { getPassedWindowCount } from "#src/services/review/getPassedWindowCount";
import { getReviewWindowStatus } from "#src/services/review/getReviewWindowStatus";
import { advanceMain } from "#src/services/review/git/advanceMain";
import { fetchRemote } from "#src/services/review/git/fetchRemote";
import { mergeMain } from "#src/services/review/git/mergeMain";
import { readReviewWindows } from "#src/services/review/readReviewWindows";
import { reviewWindows } from "#src/services/review/reviewWindows";
import { writeFixWindows } from "#src/services/review/writeFixWindows";
import { writeReviewSummary } from "#src/services/review/writeReviewSummary";
import { writeReviewWindowFindings } from "#src/services/review/writeReviewWindowFindings";
import { MAIN_BRANCH, QUEUE_BRANCH, REMOTE_MAIN_REF, REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, Operation, takeOne } from "@esposter/shared";

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

// The checkout is `ai/queue`'s tip, so a merge and its push start from the queue
const checkoutQueue = (): void => {
  runGit(["checkout", "-B", QUEUE_BRANCH, REMOTE_QUEUE_REF]);
};

const checkIsMainAncestor = (): boolean =>
  getResult(() => runGit(["merge-base", "--is-ancestor", REMOTE_MAIN_REF, REMOTE_QUEUE_REF])).match(
    () => true,
    () => false,
  );

const getFindings = (outcomes: ReviewBatchOutcome[]): ReviewFinding[] =>
  outcomes.flatMap((outcome) => ("findings" in outcome ? outcome.findings : []));

const getErrors = (outcomes: ReviewBatchOutcome[]): Error[] =>
  outcomes.flatMap((outcome) => ("error" in outcome ? [outcome.error] : []));

// Plans every window owed, reviews all of their batches in one pool, then advances `main` through the passed prefix (steady
// Mode) and hands each passed window's findings to a fixer job. A window that did not pass stops the prefix, so `main`
// Never moves past a window no review read in full. The summary says what each window did.
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
    writeFixWindows([]);
    writeReviewSummary([`${REMOTE_MAIN_REF} was merged into ${QUEUE_BRANCH}, and that push starts the next run.`]);
    return;
  }

  // The cap bounds one run's matrix: the windows past it are planned again by the next run
  const planned = readReviewWindows(range);
  const windows = planned.slice(0, REVIEW_RUN_WINDOW_CAP);
  if (windows.length === 0) {
    console.info("nothing owed");
    writeFixWindows([]);
    return;
  }
  console.info(`${planned.length} window(s) owed, ${windows.length} planned for this run`);
  for (const [index, window] of windows.entries()) console.info(formatReviewWindow(window, index));
  if (isDryRun) return;

  const outcomesByWindow = await reviewWindows(windows);
  const statuses = outcomesByWindow.map((outcomes) => getReviewWindowStatus(outcomes));
  const passedCount = getPassedWindowCount(statuses);
  const findingsByWindow = outcomesByWindow.map((outcomes) => getFindings(outcomes));

  // Range mode never moves `main`. Steady mode moves it once, to the last passed window's end, and a rejected push means
  // `main` moved meanwhile: those windows may be stale, so no fixer runs on them, and the next run re-measures
  let mainNotice = `${MAIN_BRANCH} did not move, because no window passed.`;
  let isMainMoved = false;
  if (mode === ReviewMode.Range) mainNotice = `A range review never moves ${MAIN_BRANCH}.`;
  else if (passedCount > 0) {
    const { end } = takeOne(windows, passedCount - 1);
    isMainMoved = advanceMain(end);
    mainNotice = isMainMoved
      ? `${MAIN_BRANCH} advanced to ${end.slice(0, 12)}.`
      : `${MAIN_BRANCH} was not advanced, because it moved meanwhile. The next run re-measures, and no fixer runs on these windows.`;
  }

  const isFixable = mode === ReviewMode.Range || isMainMoved;
  const fixWindowIndices = isFixable
    ? findingsByWindow.flatMap((findings, index) => (index < passedCount && findings.length > 0 ? [index] : []))
    : [];
  if (findingsDirectory !== "")
    for (const index of fixWindowIndices) {
      const { base, end } = takeOne(windows, index);
      writeReviewWindowFindings(findingsDirectory, index, { base, end, findings: takeOne(findingsByWindow, index) });
    }
  writeFixWindows(fixWindowIndices);

  const summary = [
    "## Review",
    "",
    "| Window | Range | Batches | Findings | Status |",
    "| --- | --- | --- | --- | --- |",
    ...windows.map(
      ({ base, batches, end }, index) =>
        `| ${index} | \`${base.slice(0, 12)}..${end.slice(0, 12)}\` | ${batches.length} | ${takeOne(findingsByWindow, index).length} | ${takeOne(statuses, index)} |`,
    ),
    "",
    mainNotice,
  ];
  if (planned.length > windows.length)
    summary.push(
      `${planned.length - windows.length} window(s) past the cap of ${REVIEW_RUN_WINDOW_CAP} wait for the next run.`,
    );
  summary.push(
    fixWindowIndices.length > 0 ? `Fixers run on window(s) ${fixWindowIndices.join(", ")}.` : "No fixer runs.",
  );
  // The first window that did not pass ends the prefix, and in range mode its base is where a resume starts
  if (passedCount < windows.length) {
    const { base } = takeOne(windows, passedCount);
    const resume = mode === ReviewMode.Range ? ` Resume with \`from=${base}\`.` : "";
    const cause =
      takeOne(statuses, passedCount) === ReviewWindowStatus.Limited
        ? `Claude's usage limit stopped window ${passedCount}`
        : `window ${passedCount} did not pass`;
    summary.push("", `${cause}, so the windows after it did not pass.${resume}`);
  }
  for (const [index, outcomes] of outcomesByWindow.entries())
    for (const error of getErrors(outcomes)) summary.push(`- window ${index}: ${error.message}`);
  writeReviewSummary(summary);

  // Set after the outputs and files are written, so the run shows red while the passed prefix still advanced and its
  // Fixers still run
  if (statuses.includes(ReviewWindowStatus.Failed)) process.exitCode = 1;
};
