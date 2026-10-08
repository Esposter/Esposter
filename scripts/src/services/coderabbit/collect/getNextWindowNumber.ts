import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WINDOW_BRANCH_PREFIX } from "#src/services/coderabbit/collect/constants";

// One above the highest number any window pull request carries in its head, open or closed: a closed window keeps its
// number, so the next one never reuses it. A head under the prefix that is not numbered is no window and is skipped.
export const getNextWindowNumber = (windowPullRequests: WindowPullRequest[]): number => {
  const windowNumbers = windowPullRequests.flatMap(({ headRefName }) => {
    const numberText = headRefName.slice(WINDOW_BRANCH_PREFIX.length);
    return headRefName.startsWith(WINDOW_BRANCH_PREFIX) && /^\d+$/u.test(numberText) ? [Number(numberText)] : [];
  });
  return Math.max(0, ...windowNumbers) + 1;
};
