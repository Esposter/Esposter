import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { RecutWindowStackInput } from "#src/models/coderabbit/collect/RecutWindowStackInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { DEVELOP_BRANCH, WINDOW_RECUT_MARKER } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { orderWindowStack } from "#src/services/coderabbit/collect/orderWindowStack";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { runGh } from "#src/services/shared/runGh";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// A window that cannot be reviewed or merged as it stands is cut again rather than held: `develop` moves back to just
// Below it, then it and every window stacked above it are closed with their branches deleted, top first, since deleting
// A branch closes the pull request based on it. Their commits stay reachable from `ai/queue`, so the next port owes
// Them again and the opener cuts them anew under the cap each closed window carries. `develop` goes first, under a
// Lease on the sha read now: a refused lease closes nothing, so no window is ever closed over a `develop` that still
// Carries it.
export const recutWindowStack = ({ cwd, fileCap, isDryRun, reason, window }: RecutWindowStackInput): CycleOutcome => {
  const stack = orderWindowStack(readWindowPullRequests(WindowPullRequestListState.Open));
  const index = stack.findIndex(({ number }) => number === window.number);
  if (index === -1)
    return {
      kind: CycleOutcomeKind.Idle,
      reason: `pull request #${window.number} is not on the open stack — nothing to cut again`,
    };

  const recutWindows = stack.slice(index);
  const { developSha, mainSha } = readBranchShas(cwd);
  // The bottom window was cut from `main`, so `develop` returns to where the two last met; any other returns to the
  // Head of the window below, which stays open
  const targetSha =
    index === 0
      ? runGit(["merge-base", takeOne(recutWindows).headRefOid, mainSha], cwd).trim()
      : takeOne(stack, index - 1).headRefOid;
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, isRewrite: true, sha: targetSha }))
    return getMovedOutcome(DEVELOP_BRANCH);

  const body = `<!-- ${WINDOW_RECUT_MARKER} cap:${fileCap} -->\nCut again under a cap of ${fileCap} files: ${reason}.`;
  for (const { number } of recutWindows.toReversed())
    if (isDryRun) console.info(`would close pull request #${number} and delete its branch to cut it again`);
    else {
      postComment(number, body);
      runGh(["pr", "close", number.toString(), "--delete-branch"]);
      console.info(`closed pull request #${number} and deleted its branch to cut it again`);
    }
  return {
    kind: CycleOutcomeKind.Idle,
    reason: `${recutWindows.map(({ number }) => `#${number}`).join(", ")} ${isDryRun ? "would be " : ""}cut again under a cap of ${fileCap} files — ${reason}`,
  };
};
