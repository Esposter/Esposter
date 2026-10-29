import type { ReviewCommit } from "#src/models/review/ReviewCommit";
import type { ReviewWindow } from "#src/models/review/ReviewWindow";

import {
  REVIEW_BATCH_CHARACTER_CAP,
  REVIEW_BATCH_FILE_CAP,
  REVIEW_BATCH_LINE_CAP,
} from "#src/services/review/constants";
import { packBatches } from "#src/services/review/packBatches";
import { readReviewFiles } from "#src/services/review/readReviewFiles";
import { toPathOrder } from "#src/services/review/toPathOrder";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// A window's base is its first commit's first parent, its end its last commit, and its files are packed into batches
export const toWindow = (windowCommits: ReviewCommit[]): ReviewWindow => {
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
