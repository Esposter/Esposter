import type { ReviewCommit } from "#src/models/review/ReviewCommit";
import type { ReviewRange } from "#src/models/review/ReviewRange";
import type { ReviewWindow } from "#src/models/review/ReviewWindow";

import { REVIEW_WINDOW_FILE_CAP } from "#src/services/review/constants";
import { readCommitFiles } from "#src/services/review/readCommitFiles";
import { readOwedShas } from "#src/services/review/readOwedShas";
import { splitReviewCommits } from "#src/services/review/splitReviewCommits";
import { toWindow } from "#src/services/review/toWindow";

// Every window the commits owed split into, oldest first, so the run plans all of them at once. Empty when nothing is owed.
export const readReviewWindows = (range: ReviewRange): ReviewWindow[] => {
  const commits: ReviewCommit[] = readOwedShas(range).map((sha) => ({ files: readCommitFiles(sha), sha }));
  return splitReviewCommits(commits, REVIEW_WINDOW_FILE_CAP).map((windowCommits) => toWindow(windowCommits));
};
