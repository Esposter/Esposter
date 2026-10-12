import type { ReviewCommit } from "#src/models/review/ReviewCommit";

import { getWindowCommitCount } from "#src/services/review/getWindowCommitCount";

// Cuts the commits owed, oldest first, into consecutive windows: each takes the longest prefix of what is left that stays
// Under the file cap, so no commit sits in two windows and each window's base is the end of the one before it.
export const splitReviewCommits = (commits: ReviewCommit[], fileCap: number): ReviewCommit[][] => {
  const windows: ReviewCommit[][] = [];
  let remaining = commits;
  while (remaining.length > 0) {
    const count = getWindowCommitCount(remaining, fileCap);
    windows.push(remaining.slice(0, count));
    remaining = remaining.slice(count);
  }
  return windows;
};
