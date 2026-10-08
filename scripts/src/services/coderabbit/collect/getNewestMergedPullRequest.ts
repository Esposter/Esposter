import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";

// The number of the newest merged pull request given, windows and the release from `develop` that predates the stack
// Alike. A pull request's number is GitHub's creation order, so the highest one is the newest review the next cut answers.
export const getNewestMergedPullRequest = (
  pullRequests: Pick<WindowPullRequest, "number" | "state">[],
): number | undefined => {
  const mergedNumbers = pullRequests
    .filter(({ state }) => state === WindowPullRequestState.Merged)
    .map(({ number }) => number);
  return mergedNumbers.length === 0 ? undefined : Math.max(...mergedNumbers);
};
