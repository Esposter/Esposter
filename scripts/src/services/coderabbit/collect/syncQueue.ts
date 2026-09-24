import type { SyncQueueInput } from "#src/models/coderabbit/collect/SyncQueueInput";

import { ReplayOutcome } from "#src/models/coderabbit/collect/ReplayOutcome";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { checkIsPicked } from "#src/services/coderabbit/collect/checkIsPicked";
import {
  DEVELOP_BRANCH,
  QUEUE_BRANCH,
  REVIEW_FIXES_BRANCH,
  SYNC_PUSH_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { replayOwed } from "#src/services/coderabbit/collect/replayOwed";
import { reshapeQueue } from "#src/services/coderabbit/collect/reshapeQueue";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The rewrite's compare-and-swap, retried rather than redone: the lease names the sha the run read, and a session
// Push in between fast-forwards that sha by a commit or two — carried onto the rewrite by the same replay and
// Pushed under the lease the push moved to. Giving up instead would hand the next run the same conflict, and its
// Resolver the same minutes, to lose to the next session push. What does give up — the queue's history rewritten
// Under the run, a carried commit that conflicts with the rewrite, or a session pushing faster than the cap —
// Leaves the rewrite unpushed for the next run to replay onto what the queue then carries.
const pushRewrite = (cwd: string, expectedSha: string, isDryRun: boolean): string | undefined => {
  let leaseSha = expectedSha;
  for (let attempt = 0; attempt < SYNC_PUSH_ATTEMPT_CAP; attempt++) {
    const syncedSha = readHeadSha(cwd);
    if (pushBranch({ branch: QUEUE_BRANCH, cwd, expectedSha: leaseSha, isDryRun, isRewrite: true, sha: syncedSha }))
      return syncedSha;
    // `pushBranch` fetched the branch on its way out, so the ref is what the session pushed
    const movedSha = readSha(`origin/${QUEUE_BRANCH}`, cwd);
    if (movedSha === undefined || !checkIsAncestor(leaseSha, movedSha, cwd)) {
      console.info(`sync: ${QUEUE_BRANCH} was rewritten under the run — unpushed`);
      return undefined;
    }
    const carriedShas = getNonEmptyLines(runGit(["rev-list", "--reverse", `${leaseSha}..${movedSha}`], cwd));
    if (!checkIsPicked(carriedShas, cwd)) {
      runGit(["cherry-pick", "--abort"], cwd);
      console.info(`sync: ${QUEUE_BRANCH} moved under the rewrite and a commit it gained conflicts with it — unpushed`);
      return undefined;
    }
    console.info(`sync: ${QUEUE_BRANCH} moved under the rewrite — carried the ${carriedShas.length} commits it gained`);
    leaseSha = movedSha;
  }
  return undefined;
};
// The queue follows what the collector pushed, rewritten by the collector itself: the commits it still owes are
// Replayed in order onto the tree the next window is built on — the fixes branch while it owes develop commits,
// Develop otherwise — the first commit alone over the cap is repackaged (`reshapeQueue`), and the result is
// Pushed back under a lease on the sha that was read. A queue left on an old base carries commits written
// Against files a drain has since repaired, and every one is a conflict the porter would hold on; here it is met
// Once, by the drain's own session, and the working session's `git pull --rebase` afterwards replays only what
// It committed since (`review-queue` skill). Returns the sha the port reads — the rewritten head, or the one
// Read when nothing was rewritten — or nothing when the queue moved under the run: the push that moved it fires
// A run of its own, and a port read off the stale head would hold on a conflict the next run resolves.
export const syncQueue = async ({
  collectorSha,
  cwd,
  developSha,
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
    // An unresolved conflict leaves the queue where it was, for the port to hold on
    if (replayOutcome !== ReplayOutcome.Replayed) return queueSha;
  }

  const isReshaped = await reshapeQueue({ collectorSha, cwd, isDryRun, targetSha, viewerLogin });
  if (isOnTarget && !isReshaped) return queueSha;
  else return pushRewrite(cwd, queueSha, isDryRun);
};
