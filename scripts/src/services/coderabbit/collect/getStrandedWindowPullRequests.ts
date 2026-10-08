import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";

// The open window pull requests whose base is the head of a merged window: the merge retargets the window above it
// Before it deletes its head, so one still standing on a merged head is a retarget that did not land. A window on a
// Closed head is a person's pause instead (`getPausedWindow`), and one on `main` or an open head is in order.
export const getStrandedWindowPullRequests = (
  openPullRequests: WindowPullRequest[],
  windowHistory: WindowPullRequest[],
): WindowPullRequest[] => {
  const mergedHeadRefNames = new Set(
    windowHistory.filter(({ state }) => state === WindowPullRequestState.Merged).map(({ headRefName }) => headRefName),
  );
  return openPullRequests.filter(({ baseRefName }) => mergedHeadRefNames.has(baseRefName));
};
