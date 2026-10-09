import type { QueueRewriteInput } from "#src/models/coderabbit/collect/QueueRewriteInput";

import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { QUEUE_BRANCH, SYNC_PUSH_ATTEMPT_CAP } from "#src/services/coderabbit/collect/constants";
import { parkCommits } from "#src/services/coderabbit/collect/parkCommits";
import { pickSkippingStops } from "#src/services/coderabbit/collect/pickSkippingStops";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The queue's rewrite at HEAD — the sync's replay, or a held commit re-landed on the queue's head — pushed by
// Compare-and-swap, retried rather than redone: the lease names the sha the run read, and a session push in between
// Fast-forwards that sha by a commit or two — carried onto the rewrite by the same replay and pushed under the lease
// The push moved to. Giving up instead would hand the next run the same conflict, and its resolver the same minutes,
// To lose to the next session push. A carried commit that conflicts with the rewrite is parked on its held branch and
// Skipped, with any later one that no longer applies without it, so the rest still rides the push and the rewrite's
// Work is never thrown away for one commit. What does give up — the queue's history rewritten under the run, or a
// Session pushing faster than the cap — leaves the rewrite unpushed for the next run to replay onto what the queue
// Then carries.
export const pushQueueRewrite = ({ cwd, isDryRun, queueSha, viewerLogin }: QueueRewriteInput): string | undefined => {
  let leaseSha = queueSha;
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
    const gainedShas = getNonEmptyLines(runGit(["rev-list", "--reverse", `${leaseSha}..${movedSha}`], cwd));
    const parkedShas = pickSkippingStops(gainedShas, cwd);
    console.info(
      `sync: ${QUEUE_BRANCH} moved under the rewrite — carried ${gainedShas.length - parkedShas.length} of the ${gainedShas.length} commits it gained`,
    );
    if (parkedShas.length > 0)
      parkCommits({
        cause: `it was pushed to \`${QUEUE_BRANCH}\` while the collector rewrote it, and conflicts with the rewrite`,
        cwd,
        isDryRun,
        shas: parkedShas,
        viewerLogin,
      });
    leaseSha = movedSha;
  }
  return undefined;
};
