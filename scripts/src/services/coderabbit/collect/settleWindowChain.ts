import type { WindowChain } from "#src/models/coderabbit/collect/WindowChain";
import type { WindowChainInput } from "#src/models/coderabbit/collect/WindowChainInput";

import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { checkIsWindowBranch } from "#src/services/coderabbit/collect/checkIsWindowBranch";
import { closeRecutWindows } from "#src/services/coderabbit/collect/closeRecutWindows";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getWindowFileCap } from "#src/services/coderabbit/collect/getWindowFileCap";
import { orderWindowStack } from "#src/services/coderabbit/collect/orderWindowStack";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readRecutFileCaps } from "#src/services/coderabbit/collect/readRecutFileCaps";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// The stack the walk merges, with a fork or a gap in it recovered rather than failing every run: every open window off
// The chain from `main` — each one above a fork, and each one whose base no open window carries — is closed for the
// Opener to cut again, at the cap it was cut under, and `develop` moves back to the top of the chain, or to where it
// Last met `main` when no chain is left. A closed window's review is asked again by its replacement's opening. The
// Release from `develop` is never closed, its head being `develop`, nor is `develop` moved while it is open; a window
// Whose head a chained window carries keeps its branch, which is the chain's own. Returns the chain, and what closing
// The rest came to — a `develop` that moved under the run closes nothing and owes the run its wake.
export const settleWindowChain = ({ cwd, isDryRun, stackPullRequests, viewerLogin }: WindowChainInput): WindowChain => {
  const stack = orderWindowStack(stackPullRequests);
  const strayWindows = stackPullRequests
    .filter(
      ({ headRefName }) =>
        checkIsWindowBranch(headRefName) && !stack.some((stacked) => stacked.headRefName === headRefName),
    )
    .toSorted((firstWindow, secondWindow) => firstWindow.number - secondWindow.number);
  if (strayWindows.length === 0) return { stack };

  const { developSha, mainSha } = readBranchShas(cwd);
  const isReleaseOpen = stackPullRequests.some(({ headRefName }) => !checkIsWindowBranch(headRefName));
  const lowestNumber = takeOne(strayWindows).number;
  const windowHistory = readWindowPullRequests(WindowPullRequestListState.All);
  const recut = closeRecutWindows({
    cwd,
    developSha,
    fileCap: getWindowFileCap(
      windowHistory.filter(({ number }) => number < lowestNumber),
      readRecutFileCaps(windowHistory, viewerLogin),
    ),
    isDryRun,
    reason: `the window stack forks or has a gap, and these windows are off its chain from ${MAIN_BRANCH}`,
    targetSha: isReleaseOpen
      ? developSha
      : (stack.at(-1)?.headRefOid ?? runGit(["merge-base", developSha, mainSha], cwd).trim()),
    windows: strayWindows,
  });
  return { recut, stack };
};
