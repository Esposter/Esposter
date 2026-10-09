import type { SyncQueueInput } from "#src/models/coderabbit/collect/SyncQueueInput";

import { ReplayOutcome } from "#src/models/coderabbit/collect/ReplayOutcome";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { DEVELOP_BRANCH, QUEUE_BRANCH, REVIEW_FIXES_BRANCH } from "#src/services/coderabbit/collect/constants";
import { pushQueueRewrite } from "#src/services/coderabbit/collect/pushQueueRewrite";
import { replayOwed } from "#src/services/coderabbit/collect/replayOwed";
import { reshapeQueue } from "#src/services/coderabbit/collect/reshapeQueue";
import { runGit } from "#src/services/shared/runGit";

// The queue follows what the collector pushed, rewritten by the collector itself: the commits it still owes are
// Replayed in order onto the tree the next window is built on — the fixes branch while it owes develop commits,
// Develop otherwise — the first commit alone over the window's room is repackaged (`reshapeQueue`), and the result is
// Pushed back under a lease on the sha that was read. A queue left on an old base carries commits written
// Against files a drain has since repaired, and every one is a conflict the porter would hold on; here it is met
// Once, by the drain's own session, and a commit past either step's attempt cap is parked rather than left in the
// Port's way. The working session's `git pull --rebase` afterwards replays only what it committed since
// (`review-queue` skill). Returns the sha the port reads — the rewritten head, or the one read when nothing was
// Rewritten — or nothing when the queue's history was rewritten under the run, or it kept moving past the push's
// Attempts: the push that moved it fires a run of its own, and a port read off the stale head would hold on a conflict
// The next run resolves.
export const syncQueue = async ({
  baseSha,
  collectorSha,
  cwd,
  developSha,
  fileCap,
  isDryRun,
  owingFixesSha,
  queueSha,
  viewerLogin,
}: SyncQueueInput): Promise<string | undefined> => {
  const targetSha = owingFixesSha ?? developSha;
  const isOnTarget = checkIsAncestor(targetSha, queueSha, cwd);
  if (isOnTarget) runGit(["switch", "--detach", queueSha], cwd);
  else {
    const targetBranch = owingFixesSha === undefined ? DEVELOP_BRANCH : REVIEW_FIXES_BRANCH;
    const replayOutcome = await replayOwed({
      branch: QUEUE_BRANCH,
      collectorSha,
      cwd,
      isDryRun,
      sourceSha: queueSha,
      targetBranch,
      targetSha,
      viewerLogin,
    });
    // A dry run resolves nothing, and leaves the queue where it was
    if (replayOutcome === ReplayOutcome.Aborted) return queueSha;
  }

  const isReshaped = await reshapeQueue({ baseSha, collectorSha, cwd, fileCap, isDryRun, targetSha, viewerLogin });
  if (isOnTarget && !isReshaped) return queueSha;
  else return pushQueueRewrite({ cwd, isDryRun, queueSha, viewerLogin });
};
