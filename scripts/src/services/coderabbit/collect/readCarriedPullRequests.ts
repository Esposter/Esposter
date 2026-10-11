import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { readRecutComment } from "#src/services/coderabbit/collect/readRecutComment";

// The re-cut windows whose findings a window's drain carries: the closed windows directly below it that a re-cut gave
// Back to the opener, newest first. A re-cut can close a window whose review already completed — a fold past its
// Attempts, a window off the chain — and its commits are cut again into the window above it, or the first of several,
// So the drain that answers that window answers theirs too, against a `develop` that carries the same code again. The
// Run ends at the first window below that is not a re-cut one; a pull request that is no window carries nothing.
export const readCarriedPullRequests = (
  windowHistory: WindowPullRequest[],
  pullRequest: number,
  viewerLogin: string,
): number[] => {
  const newestFirst = windowHistory.toSorted((firstWindow, secondWindow) => secondWindow.number - firstWindow.number);
  const index = newestFirst.findIndex(({ number }) => number === pullRequest);
  if (index === -1) return [];

  const carriedPullRequests: number[] = [];
  for (const { number, state } of newestFirst.slice(index + 1)) {
    if (state !== WindowPullRequestState.Closed || readRecutComment(number, viewerLogin) === undefined) break;
    carriedPullRequests.push(number);
  }
  return carriedPullRequests;
};
