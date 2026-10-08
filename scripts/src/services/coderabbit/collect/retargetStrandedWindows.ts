import type { RetargetStrandedWindowsInput } from "#src/models/coderabbit/collect/RetargetStrandedWindowsInput";
import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getStrandedWindowPullRequests } from "#src/services/coderabbit/collect/getStrandedWindowPullRequests";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { runGh } from "#src/services/shared/runGh";
import { runGit } from "#src/services/shared/runGit";
import { getResult, noop } from "@esposter/shared";

// The recovery for a merge whose retarget failed: the window above the merged one is retargeted to `main` and the
// merged head deleted, the order the merge itself keeps. A dry run reports the same stack in memory and moves nothing.
// Returns the open window pull requests as they stand once this is done.
export const retargetStrandedWindows = ({
  cwd,
  isDryRun,
  openPullRequests,
  windowHistory,
}: RetargetStrandedWindowsInput): WindowPullRequest[] => {
  const strandedPullRequests = getStrandedWindowPullRequests(openPullRequests, windowHistory);
  if (strandedPullRequests.length === 0) return openPullRequests;
  else if (isDryRun) {
    for (const { number } of strandedPullRequests)
      console.info(`would retarget pull request #${number} to ${MAIN_BRANCH}`);
    return openPullRequests.map((openPullRequest) =>
      strandedPullRequests.includes(openPullRequest)
        ? { ...openPullRequest, baseRefName: MAIN_BRANCH }
        : openPullRequest,
    );
  }

  for (const { baseRefName, number } of strandedPullRequests) {
    runGh(["pr", "edit", number.toString(), "--base", MAIN_BRANCH]);
    getResult(() => runGit(["push", "origin", "--delete", baseRefName], cwd)).match(noop, console.error);
  }
  return readWindowPullRequests(WindowPullRequestListState.Open);
};
