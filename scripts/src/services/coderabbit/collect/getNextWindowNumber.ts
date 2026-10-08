import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { checkIsWindowBranch } from "#src/services/coderabbit/collect/checkIsWindowBranch";
import { WINDOW_BRANCH_PREFIX } from "#src/services/coderabbit/collect/constants";

// One above the highest number any window pull request carries in its head, open or closed: a closed window keeps its
// Number, so the next one never reuses it. A head that is not a numbered window is skipped.
export const getNextWindowNumber = (windowPullRequests: WindowPullRequest[]): number => {
  const windowNumbers = windowPullRequests
    .filter(({ headRefName }) => checkIsWindowBranch(headRefName))
    .map(({ headRefName }) => Number(headRefName.slice(WINDOW_BRANCH_PREFIX.length)));
  return Math.max(0, ...windowNumbers) + 1;
};
