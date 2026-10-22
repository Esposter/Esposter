import type { ReviewCommit } from "#src/models/review/ReviewCommit";
import type { ReviewFile } from "#src/models/review/ReviewFile";
import type { ReviewRange } from "#src/models/review/ReviewRange";
import type { ReviewWindow } from "#src/models/review/ReviewWindow";

import {
  REVIEW_BATCH_CHARACTER_CAP,
  REVIEW_BATCH_FILE_CAP,
  REVIEW_BATCH_LINE_CAP,
  REVIEW_WINDOW_FILE_CAP,
} from "#src/services/review/constants";
import { packBatches } from "#src/services/review/packBatches";
import { readCommitFiles } from "#src/services/review/readCommitFiles";
import { readOwedShas } from "#src/services/review/readOwedShas";
import { readReviewFiles } from "#src/services/review/readReviewFiles";
import { splitReviewCommits } from "#src/services/review/splitReviewCommits";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// Path order, by code unit, so the same range always packs the same batches on any machine
const toPathOrder = (left: ReviewFile, right: ReviewFile): number => {
  if (left.path === right.path) return 0;
  return left.path < right.path ? -1 : 1;
};

// A window's base is its first commit's first parent, its end its last commit, and its files are packed into batches
const toWindow = (windowCommits: ReviewCommit[]): ReviewWindow => {
  const base = runGit(["rev-parse", `${takeOne(windowCommits, 0).sha}^1`]).trim();
  const end = takeOne(windowCommits, windowCommits.length - 1).sha;
  const files = readReviewFiles(base, end).toSorted(toPathOrder);

  return {
    base,
    batches: packBatches(files, REVIEW_BATCH_FILE_CAP, REVIEW_BATCH_LINE_CAP, REVIEW_BATCH_CHARACTER_CAP),
    commitShas: windowCommits.map(({ sha }) => sha),
    end,
  };
};

// Every window the commits owed split into, oldest first, so the run plans all of them at once. Empty when nothing is owed.
export const readReviewWindows = (range: ReviewRange): ReviewWindow[] => {
  const commits: ReviewCommit[] = readOwedShas(range).map((sha) => ({ files: readCommitFiles(sha), sha }));
  return splitReviewCommits(commits, REVIEW_WINDOW_FILE_CAP).map((windowCommits) => toWindow(windowCommits));
};
