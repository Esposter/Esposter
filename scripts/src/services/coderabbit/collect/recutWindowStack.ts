import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { RecutWindowStackInput } from "#src/models/coderabbit/collect/RecutWindowStackInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import { checkIsWindowBranch } from "#src/services/coderabbit/collect/checkIsWindowBranch";
import { closeRecutWindows } from "#src/services/coderabbit/collect/closeRecutWindows";
import { orderWindowStack } from "#src/services/coderabbit/collect/orderWindowStack";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// A window that cannot be reviewed or merged as it stands is cut again rather than held: it and every window stacked
// Above it are closed for the opener to cut anew (`closeRecutWindows`), with `develop` moved back to just below it. The
// Release from `develop` is the stack's bottom while it is open, as the cycle reads it, though no window list holds it.
export const recutWindowStack = ({ cwd, fileCap, isDryRun, reason, window }: RecutWindowStackInput): CycleOutcome => {
  const openWindows = readWindowPullRequests(WindowPullRequestListState.Open);
  const stack = orderWindowStack(checkIsWindowBranch(window.headRefName) ? openWindows : [window, ...openWindows]);
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
  return closeRecutWindows({ cwd, developSha, fileCap, isDryRun, reason, targetSha, windows: recutWindows });
};
