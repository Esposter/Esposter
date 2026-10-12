import type { ReviewBatchJob } from "#src/models/review/ReviewBatchJob";
import type { ReviewBatchOutcome } from "#src/models/review/ReviewBatchOutcome";
import type { ReviewWindow } from "#src/models/review/ReviewWindow";

import { REVIEW_RUNNER_SESSION_CAP } from "#src/services/review/constants";
import { reviewBatch } from "#src/services/review/reviewBatch";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { runGit } from "#src/services/shared/runGit";
import { getResultAsync, takeOne, withFinalizerAsync } from "@esposter/shared";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Every batch of every window in one pool, at most `REVIEW_RUNNER_SESSION_CAP` sessions at once, taken in window order so
// The earliest windows finish first. Each batch's outcome lands in its window's list at its batch index, and a batch's
// Error is its outcome, so the others still finish and the run decides what the failures mean.
export const reviewWindows = async (windows: ReviewWindow[]): Promise<ReviewBatchOutcome[][]> => {
  const outcomesByWindow = windows.map((): ReviewBatchOutcome[] => []);
  const jobs: ReviewBatchJob[] = windows.flatMap((window, windowIndex) =>
    window.batches.map((files, batchIndex) => ({ batchIndex, files, windowIndex })),
  );
  // A window's worktree is made once, detached at its end, when its first batch starts, and every reviewer of the window
  // Reads from it. The finalizer removes each one, whichever way the pool ends.
  const directories = new Map<number, string>();
  const getDirectory = (windowIndex: number, end: string): string => {
    const known = directories.get(windowIndex);
    if (known !== undefined) return known;

    const directory = join(tmpdir(), `review-${crypto.randomUUID()}`);
    runGit(["worktree", "add", "--detach", directory, end]);
    directories.set(windowIndex, directory);
    return directory;
  };

  await withFinalizerAsync(
    () =>
      forEachConcurrently(jobs, REVIEW_RUNNER_SESSION_CAP, async ({ batchIndex, files, windowIndex }) => {
        const { base, end } = takeOne(windows, windowIndex);
        // The directory's throw is caught as a rejection, which only an async call makes of it
        // oxlint-disable-next-line typescript/require-await -- the async wrapper turns a synchronous throw into a rejection
        const outcome = await getResultAsync(async () =>
          reviewBatch(getDirectory(windowIndex, end), base, end, files),
        ).match(
          (reviewed): ReviewBatchOutcome => reviewed,
          (error): ReviewBatchOutcome => ({ error }),
        );
        takeOne(outcomesByWindow, windowIndex)[batchIndex] = outcome;
      }),
    () => {
      for (const directory of directories.values()) runGit(["worktree", "remove", "--force", directory]);
    },
  );
  return outcomesByWindow;
};
