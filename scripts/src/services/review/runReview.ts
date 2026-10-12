import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";
import type { ReviewFinding } from "#src/models/review/ReviewFinding";
import type { ReviewRange } from "#src/models/review/ReviewRange";
import type { ReviewWindow } from "#src/models/review/ReviewWindow";

import { ReviewMode } from "#src/models/review/ReviewMode";
import { ReviewOutcome } from "#src/models/review/ReviewOutcome";
import { ReviewSessionLimitedError } from "#src/models/review/ReviewSessionLimitedError";
import { MAIN_BRANCH, MAIN_REF, QUEUE_BRANCH, QUEUE_REF, REVIEW_CONCURRENCY } from "#src/services/review/constants";
import { advanceMain } from "#src/services/review/git/advanceMain";
import { landCommits } from "#src/services/review/git/landCommits";
import { mergeMain } from "#src/services/review/git/mergeMain";
import { createDeferredIssue } from "#src/services/review/createDeferredIssue";
import { dispatchContinuation } from "#src/services/review/dispatchContinuation";
import { formatReviewWindow } from "#src/services/review/formatReviewWindow";
import { readOwedShas } from "#src/services/review/readOwedShas";
import { readReviewWindow } from "#src/services/review/readReviewWindow";
import { resolveDispositions } from "#src/services/review/resolveDispositions";
import { reviewBatch } from "#src/services/review/reviewBatch";
import { runFixer } from "#src/services/review/runFixer";
import { writeReviewSummary } from "#src/services/review/writeReviewSummary";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { PNPM_ARGS, PNPM_FILE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult, getResultAsync, takeOne } from "@esposter/shared";
import { spawnSync } from "node:child_process";

export interface ReviewRunInput {
  from: string;
  isDryRun: boolean;
  to: string;
}

// What a window's pass leaves for the run to finish with: its summary, whether it pushed to the queue (a push starts the
// next run itself), and whether the run may continue at all (a limit or a rejected `main` ends it)
interface ReviewPassResult {
  isContinuable: boolean;
  isQueuePushed: boolean;
  summary: string[];
}

const getMode = (from: string, to: string): ReviewMode => {
  if (from === "" && to === "") return ReviewMode.Steady;
  if (from === "" || to === "") throw new Error("a range review takes both --from and --to");
  return ReviewMode.Range;
};

const fetchRemote = (): void => {
  runGit([
    "fetch",
    "--quiet",
    "origin",
    `+refs/heads/${MAIN_BRANCH}:refs/remotes/origin/${MAIN_BRANCH}`,
    `+refs/heads/${QUEUE_BRANCH}:refs/remotes/origin/${QUEUE_BRANCH}`,
  ]);
};

// The checkout is `ai/queue`'s tip, so a merge and the fixer's commits and their landing all start from the queue
const checkoutQueue = (): void => {
  runGit(["checkout", "-B", QUEUE_BRANCH, QUEUE_REF]);
};

const isMainAncestor = (): boolean =>
  getResult(() => runGit(["merge-base", "--is-ancestor", MAIN_REF, QUEUE_REF])).match(
    () => true,
    () => false,
  );

const installDependencies = (): void => {
  const { status } = spawnSync(PNPM_FILE, [...PNPM_ARGS, "install"], { cwd: REPOSITORY_ROOT, stdio: "inherit" });
  if (status !== 0) throw new Error(`pnpm install exited with ${status}`);
};

const getOutcomeError = (outcome: ReviewBatchOutcome): Error | undefined =>
  "error" in outcome ? outcome.error : undefined;

// Every batch reviewed, at most `REVIEW_CONCURRENCY` at once, in batch order. A batch's error is its outcome rather than a
// throw, so the others still finish and the pass decides what the failures mean.
const reviewWindow = async ({ base, batches, end }: ReviewWindow): Promise<ReviewBatchOutcome[]> => {
  const outcomes: ReviewBatchOutcome[] = [];
  await forEachConcurrently(
    batches.map((files, index) => ({ files, index })),
    REVIEW_CONCURRENCY,
    async ({ files, index }) => {
      outcomes[index] = await getResultAsync(() => reviewBatch(base, end, files)).match(
        (outcome): ReviewBatchOutcome => outcome,
        (error): ReviewBatchOutcome => ({ error }),
      );
    },
  );
  return outcomes;
};

// A table cell's `|` would end the cell early
const toCell = (text: string): string => text.replaceAll("|", "\\|");

const getFindingRow = (finding: ReviewFinding, outcome: ReviewOutcome): string =>
  `| \`${finding.file}:${finding.line}\` | ${finding.lane} | ${outcome} | ${toCell(finding.summary)} |`;

// Reviews the window, advances `main` (steady mode), fixes what the reviewers found, lands the fixer's commits and opens
// the issue for what was deferred. Each step's failure is handled where it stands, and the summary says what happened.
const reviewWindowPass = async (range: ReviewRange, window: ReviewWindow): Promise<ReviewPassResult> => {
  const summary = [
    `## Review ${window.base.slice(0, 12)}..${window.end.slice(0, 12)}`,
    "",
    "```",
    formatReviewWindow(window),
    "```",
  ];
  const outcomes = await reviewWindow(window);

  if (outcomes.some((outcome) => getOutcomeError(outcome) instanceof ReviewSessionLimitedError)) {
    const resume = range.mode === ReviewMode.Range ? ` Resume with \`from=${window.base}\`.` : "";
    const notice = `Claude's usage limit stopped the review, so ${MAIN_BRANCH} did not move and no continuation was dispatched.${resume}`;
    console.info(notice);
    return { isContinuable: false, isQueuePushed: false, summary: [...summary, "", notice] };
  }
  // A failed batch fails the run, and nothing has moved yet: `main` advances only after every batch answered
  const failure = outcomes.map(getOutcomeError).find((error) => error !== undefined);
  if (failure !== undefined) throw failure;

  const findings = outcomes.flatMap((outcome) => ("findings" in outcome ? outcome.findings : []));
  summary.push("", `${window.batches.length} batch(es) reviewed, ${findings.length} finding(s).`);

  if (range.mode === ReviewMode.Steady) {
    if (!advanceMain(window.end)) {
      const notice = `${MAIN_BRANCH} was not advanced, because it moved meanwhile. The next run re-measures.`;
      return { isContinuable: false, isQueuePushed: false, summary: [...summary, "", notice] };
    }
    summary.push(`${MAIN_BRANCH} advanced to ${window.end.slice(0, 12)}.`);
  }
  if (findings.length === 0) return { isContinuable: true, isQueuePushed: false, summary };

  // The fixer runs in this checkout at the queue's tip, after `main` moved, so a slow fix holds nothing
  installDependencies();
  const fixer = await getResultAsync(() => runFixer(window.base, window.end, findings)).match(
    (dispositions) => ({ dispositions, failureReason: "", isLimited: false }),
    (error) =>
      error instanceof ReviewSessionLimitedError
        ? { dispositions: undefined, failureReason: "the fixer was limited by Claude's usage limit", isLimited: true }
        : { dispositions: undefined, failureReason: `the fixer failed: ${error.message}`, isLimited: false },
  );

  const isAhead = runGit(["rev-list", "--count", `${QUEUE_REF}..HEAD`]).trim() !== "0";
  const isLanded = isAhead ? landCommits() : true;
  const isQueuePushed = isAhead && isLanded;
  const answered = resolveDispositions(findings.length, fixer.dispositions, fixer.failureReason);
  // A fix whose commit never reached the queue is not a fix
  const dispositions = isLanded
    ? answered
    : answered.map((disposition) =>
        disposition.outcome === ReviewOutcome.Fixed
          ? { ...disposition, outcome: ReviewOutcome.Deferred, reason: "its commit did not land on ai/queue" }
          : disposition,
      );

  summary.push("", "| Finding | Lane | Outcome | Summary |", "| --- | --- | --- | --- |");
  for (const disposition of dispositions) {
    summary.push(getFindingRow(takeOne(findings, disposition.index), disposition.outcome));
  }

  const deferred = dispositions
    .filter(({ outcome }) => outcome === ReviewOutcome.Deferred)
    .map((disposition) => ({ disposition, finding: takeOne(findings, disposition.index) }));
  if (deferred.length > 0) {
    const issueUrl = createDeferredIssue(deferred, window.base, window.end);
    summary.push("", `Deferred findings: ${issueUrl}`);
  }
  if (fixer.isLimited)
    summary.push("", "The fixer was limited, so its findings were deferred. No continuation was dispatched.");
  return { isContinuable: !fixer.isLimited, isQueuePushed, summary };
};

// The continuation a run owes. A range always continues over what is left of its range; a steady run continues only when
// it pushed nothing, since a push starts the next run itself, and only when commits are still owed past `main`.
const dispatchOwedContinuation = (
  range: ReviewRange,
  window: ReviewWindow,
  isQueuePushed: boolean,
): string | undefined => {
  if (range.mode === ReviewMode.Range) {
    const rest = { from: window.end, mode: ReviewMode.Range, to: range.to };
    if (readOwedShas(rest).length === 0) return undefined;
    dispatchContinuation({ from: window.end, to: range.to });
    return `Dispatched the review again over ${window.end.slice(0, 12)}..${range.to.slice(0, 12)}.`;
  }
  if (isQueuePushed) return undefined;
  fetchRemote();
  if (readOwedShas(range).length === 0) return undefined;
  dispatchContinuation();
  return `Dispatched the review again, since commits are still owed past ${MAIN_BRANCH}.`;
};

export const runReview = async ({ from, isDryRun, to }: ReviewRunInput): Promise<void> => {
  const mode = getMode(from, to);
  fetchRemote();
  if (!isDryRun) checkoutQueue();
  const range: ReviewRange =
    mode === ReviewMode.Steady
      ? { from: MAIN_REF, mode, to: QUEUE_REF }
      : {
          from: runGit(["rev-parse", "--verify", `${from}^{commit}`]).trim(),
          mode,
          to: runGit(["rev-parse", "--verify", `${to}^{commit}`]).trim(),
        };

  // `main` pushed by hand past the queue is merged in first, and that push starts the next run
  if (mode === ReviewMode.Steady && !isMainAncestor()) {
    if (isDryRun) {
      console.info(`${MAIN_BRANCH} has diverged from ${QUEUE_BRANCH}: a run merges ${MAIN_REF} into it first`);
      return;
    }
    mergeMain();
    runGit(["push", "origin", `HEAD:${QUEUE_BRANCH}`]);
    writeReviewSummary([`${MAIN_REF} was merged into ${QUEUE_BRANCH}, and that push starts the next run.`]);
    return;
  }

  const window = readReviewWindow(range);
  if (window === undefined) {
    console.info("nothing owed");
    return;
  }
  console.info(formatReviewWindow(window));
  if (isDryRun) return;

  const pass = await reviewWindowPass(range, window);
  const continuation = pass.isContinuable ? dispatchOwedContinuation(range, window, pass.isQueuePushed) : undefined;
  if (continuation !== undefined) console.info(continuation);
  writeReviewSummary(continuation === undefined ? pass.summary : [...pass.summary, "", continuation]);
};
