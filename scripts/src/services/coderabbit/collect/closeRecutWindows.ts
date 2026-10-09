import type { CloseRecutWindowsInput } from "#src/models/coderabbit/collect/CloseRecutWindowsInput";
import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { WindowPullRequest } from "#src/models/coderabbit/collect/WindowPullRequest";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsWindowBranch } from "#src/services/coderabbit/collect/checkIsWindowBranch";
import { DEVELOP_BRANCH, WINDOW_RECUT_MARKER } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { runGh } from "#src/services/shared/runGh";

// The one way the collector gives windows back to the opener: `develop` moves back below them, then each is closed with
// Its branch deleted, top first, since deleting a branch closes the pull request based on it. Their commits stay
// Reachable from `ai/queue`, so the next port owes them again and the opener cuts them anew under the cap each closed
// Window carries. `develop` goes first, under a lease on the sha the run read: a refused lease closes nothing, so no
// Window is ever closed over a `develop` that still carries it. The release from `develop` is the exception, closed
// Before `develop` moves and with its branch kept: `develop` is its head, and a head moved back onto its base under an
// Open pull request leaves GitHub to decide by itself whether that pull request closed or merged.
export const closeRecutWindows = ({
  cwd,
  developSha,
  fileCap,
  isDryRun,
  reason,
  targetSha,
  windows,
}: CloseRecutWindowsInput): CycleOutcome => {
  const body = `<!-- ${WINDOW_RECUT_MARKER} cap:${fileCap} -->\nCut again under a cap of ${fileCap} files: ${reason}.`;
  const close = ({ headRefName, number }: WindowPullRequest) => {
    const isWindow = checkIsWindowBranch(headRefName);
    const closed = `pull request #${number}${isWindow ? " and delete its branch" : ""} to cut it again`;
    if (isDryRun) console.info(`would close ${closed}`);
    else {
      postComment(number, body);
      runGh(["pr", "close", number.toString(), ...(isWindow ? ["--delete-branch"] : [])]);
      console.info(`closed ${closed}`);
    }
  };
  for (const release of windows.filter(({ headRefName }) => !checkIsWindowBranch(headRefName))) close(release);
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, isRewrite: true, sha: targetSha }))
    return getMovedOutcome(DEVELOP_BRANCH);

  for (const window of windows.filter(({ headRefName }) => checkIsWindowBranch(headRefName)).toReversed())
    close(window);
  return {
    kind: CycleOutcomeKind.Idle,
    reason: `${windows.map(({ number }) => `#${number}`).join(", ")} ${isDryRun ? "would be " : ""}cut again under a cap of ${fileCap} files — ${reason}`,
  };
};
