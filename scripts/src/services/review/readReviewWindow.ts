import type { ReviewCommit } from "#src/models/review/ReviewCommit";
import type { ReviewFile } from "#src/models/review/ReviewFile";
import type { ReviewRange } from "#src/models/review/ReviewRange";
import type { ReviewWindow } from "#src/models/review/ReviewWindow";

import { REVIEW_BATCH_FILE_CAP, REVIEW_BATCH_LINE_CAP, REVIEW_WINDOW_FILE_CAP } from "#src/services/review/constants";
import { getWindowCommitCount } from "#src/services/review/getWindowCommitCount";
import { packBatches } from "#src/services/review/packBatches";
import { readCommitFiles } from "#src/services/review/readCommitFiles";
import { readOwedShas } from "#src/services/review/readOwedShas";
import { readReviewFiles } from "#src/services/review/readReviewFiles";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// Path order, by code unit, so the same range always packs the same batches on any machine
const toPathOrder = (left: ReviewFile, right: ReviewFile): number => {
  if (left.path === right.path) return 0;
  return left.path < right.path ? -1 : 1;
};

// The window a run reviews: the longest prefix of the commits owed that stays under the file cap, its base the first
// commit's first parent, and its files packed into batches. `undefined` when nothing is owed.
export const readReviewWindow = (range: ReviewRange): ReviewWindow | undefined => {
  const shas = readOwedShas(range);
  if (shas.length === 0) return undefined;

  const commits: ReviewCommit[] = shas.map((sha) => ({ files: readCommitFiles(sha), sha }));
  const commitCount = getWindowCommitCount(commits, REVIEW_WINDOW_FILE_CAP);
  const windowCommits = commits.slice(0, commitCount);
  const base = runGit(["rev-parse", `${takeOne(windowCommits, 0).sha}^1`]).trim();
  const end = takeOne(windowCommits, commitCount - 1).sha;
  const files = readReviewFiles(base, end).toSorted(toPathOrder);

  return {
    base,
    batches: packBatches(files, REVIEW_BATCH_FILE_CAP, REVIEW_BATCH_LINE_CAP),
    end,
    owedAfter: shas.length - commitCount,
    commitShas: windowCommits.map(({ sha }) => sha),
  };
};
