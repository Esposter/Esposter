import type { ReviewBatchJob } from "#src/models/review/ReviewBatchJob";
import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";
import type { ReviewWindow } from "#src/models/review/ReviewWindow";

import { REVIEW_RUNNER_SESSION_CAP } from "#src/services/review/constants";
import { reviewBatch } from "#src/services/review/reviewBatch";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { runGit } from "#src/services/shared/runGit";
import { getResult, getResultAsync, noop, takeOne, withFinalizerAsync } from "@esposter/shared";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { v7 } from "uuid";

// Every batch of every window in one pool, at most `REVIEW_RUNNER_SESSION_CAP` sessions at once, taken in window order so
// The earliest windows finish first. A batch not started by `deadline` (epoch milliseconds) is unreached rather than read,
// And so is every batch not started once one has errored: the batches still waiting belong to that window or a later one,
// Whose findings no run can open past a window that did not pass, so reading them would only spend a failing account's
// Sessions again.
// Each batch's outcome lands in its window's list at its batch index, and a batch's error is its outcome, so the others
// Still finish. `onWindowSettled` runs as each window's last batch lands, so the run acts on a window while the pool goes on.
export const reviewWindows = async (
  windows: ReviewWindow[],
  deadline: number,
  onWindowSettled: (windowIndex: number, outcomes: ReviewBatchOutcome[]) => void,
): Promise<void> => {
  const outcomesByWindow = windows.map((): ReviewBatchOutcome[] => []);
  const pendingByWindow = windows.map((window) => window.batches.length);
  // A window with no batch has nothing to read, so it settles before the pool starts
  for (const [windowIndex, pending] of pendingByWindow.entries()) if (pending === 0) onWindowSettled(windowIndex, []);

  const jobs: ReviewBatchJob[] = windows.flatMap((window, windowIndex) =>
    window.batches.map((files, batchIndex) => ({ batchIndex, files, windowIndex })),
  );
  // A window's worktree is made once, detached at its end, when its first batch starts, and every reviewer of the window
  // Reads from it. The finalizer removes each one, whichever way the pool ends.
  let isStopped = false;
  const directories = new Map<number, string>();
  const getDirectory = (windowIndex: number, end: string): string => {
    const known = directories.get(windowIndex);
    if (known !== undefined) return known;

    const directory = join(tmpdir(), `review-${v7()}`);
    runGit(["worktree", "add", "--detach", directory, end]);
    directories.set(windowIndex, directory);
    return directory;
  };

  const runJob = async ({ batchIndex, files, windowIndex }: ReviewBatchJob) => {
    const { base, end } = takeOne(windows, windowIndex);
    // The directory's throw is caught as an error: getResultAsync awaits its callback inside its own try, so a
    // Synchronous throw from the callback lands in the same Err as a rejection
    const outcome: ReviewBatchOutcome =
      Date.now() >= deadline || isStopped
        ? { isUnreached: true }
        : await getResultAsync(() => reviewBatch(getDirectory(windowIndex, end), base, end, files)).match(
            (reviewed): ReviewBatchOutcome => reviewed,
            (error): ReviewBatchOutcome => ({ error }),
          );
    if ("error" in outcome) isStopped = true;
    takeOne(outcomesByWindow, windowIndex)[batchIndex] = outcome;
    const pending = takeOne(pendingByWindow, windowIndex) - 1;
    pendingByWindow[windowIndex] = pending;
    if (pending === 0) onWindowSettled(windowIndex, takeOne(outcomesByWindow, windowIndex));
  };
  // The first batch runs alone, so a failure every batch would share, such as a credential that no longer works, costs one
  // Batch and its retry rather than a whole pool of them
  const [firstJob, ...otherJobs] = jobs;

  await withFinalizerAsync(
    async () => {
      if (firstJob) await runJob(firstJob);
      await forEachConcurrently(otherJobs, REVIEW_RUNNER_SESSION_CAP, runJob);
    },
    // A worktree Windows still holds a file of is left behind with a warning rather than failing the run: by the
    // Finalizer, main has already moved, and `git worktree prune` drops its entry once the directory is gone
    () => {
      for (const directory of directories.values())
        getResult(() => runGit(["worktree", "remove", "--force", directory])).match(noop, (error) => {
          console.warn(`could not remove the review worktree ${directory}: ${error.message}`);
        });
    },
  );
};
