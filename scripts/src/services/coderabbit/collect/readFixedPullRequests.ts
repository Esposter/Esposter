import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { getNewestWindowPullRequest } from "#src/services/coderabbit/collect/getNewestWindowPullRequest";
import { readMergedPullRequestsSince } from "#src/services/coderabbit/collect/readMergedPullRequestsSince";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { runGit } from "#src/services/shared/runGit";

// The merged pull requests whose findings a fix may answer: every one merged since the newest window opened before the
// Fix was written. A review is drained before any window opens above it, so the review a fix answers merged after that
// Opening, wherever the cap has since put the fix — fixes it split over several windows still answer a review merged
// Before the first of them opened, which the run's look-back from the newest window stops short of
export const readFixedPullRequests = (fixSha: string, cwd: string): number[] => {
  // A pick keeps the author's date, so it is the drain's commit whatever replays carried the fix since
  const writtenAtMs = Temporal.Instant.from(
    runGit(["log", "-1", "--format=%aI", fixSha], cwd).trim(),
  ).epochMilliseconds;
  const window = getNewestWindowPullRequest(
    readWindowPullRequests(WindowPullRequestListState.All).filter(
      ({ createdAt }) => Temporal.Instant.from(createdAt).epochMilliseconds <= writtenAtMs,
    ),
  );
  return window === undefined ? [] : readMergedPullRequestsSince(window.createdAt);
};
