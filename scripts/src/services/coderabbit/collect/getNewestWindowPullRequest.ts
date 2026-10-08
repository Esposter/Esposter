import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

// The newest window pull request in any state, which is where a limit Claude Code hit is marked and the pause reads
export const getNewestWindowPullRequest = (windowPullRequests: WindowPullRequest[]): undefined | WindowPullRequest =>
  windowPullRequests.reduce<undefined | WindowPullRequest>(
    (newest, windowPullRequest) =>
      newest === undefined || windowPullRequest.number > newest.number ? windowPullRequest : newest,
    undefined,
  );
