import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestState } from "#src/models/coderabbit/collect/WindowPullRequestState";
import { getNewestWindowPullRequest } from "#src/services/coderabbit/collect/getNewestWindowPullRequest";

// A window closed without merging is a person's pause, as a closed release was: the newest window closed, or one an
// Open window is still stacked on, since nothing above a closed window has a base it can merge into
export const getPausedWindow = (
  windowHistory: WindowPullRequest[],
  openPullRequests: WindowPullRequest[],
): undefined | WindowPullRequest => {
  const newestNumber = getNewestWindowPullRequest(windowHistory)?.number;
  return windowHistory.find(
    ({ headRefName, number, state }) =>
      state === WindowPullRequestState.Closed &&
      (number === newestNumber || openPullRequests.some(({ baseRefName }) => baseRefName === headRefName)),
  );
};
