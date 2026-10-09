import type { CloseRecutWindowsInput } from "#src/models/coderabbit/collect/CloseRecutWindowsInput";
import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { DEVELOP_BRANCH, WINDOW_RECUT_MARKER } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { runGh } from "#src/services/shared/runGh";

// The one way the collector gives windows back to the opener: `develop` moves back below them, then each is closed with
// Its branch deleted, top first, since deleting a branch closes the pull request based on it. Their commits stay
// Reachable from `ai/queue`, so the next port owes them again and the opener cuts them anew under the cap each closed
// Window carries. `develop` goes first, under a lease on the sha the run read: a refused lease closes nothing, so no
// Window is ever closed over a `develop` that still carries it.
export const closeRecutWindows = ({
  cwd,
  developSha,
  fileCap,
  isDryRun,
  reason,
  targetSha,
  windows,
}: CloseRecutWindowsInput): CycleOutcome => {
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, isRewrite: true, sha: targetSha }))
    return getMovedOutcome(DEVELOP_BRANCH);

  const body = `<!-- ${WINDOW_RECUT_MARKER} cap:${fileCap} -->\nCut again under a cap of ${fileCap} files: ${reason}.`;
  for (const { number } of windows.toReversed())
    if (isDryRun) console.info(`would close pull request #${number} and delete its branch to cut it again`);
    else {
      postComment(number, body);
      runGh(["pr", "close", number.toString(), "--delete-branch"]);
      console.info(`closed pull request #${number} and deleted its branch to cut it again`);
    }
  return {
    kind: CycleOutcomeKind.Idle,
    reason: `${windows.map(({ number }) => `#${number}`).join(", ")} ${isDryRun ? "would be " : ""}cut again under a cap of ${fileCap} files — ${reason}`,
  };
};
