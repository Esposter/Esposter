import type { SyncQueueInput } from "#src/models/coderabbit/collect/SyncQueueInput";
import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import {
  DEVELOP_BRANCH,
  QUEUE_BRANCH,
  REVIEW_FIXES_BRANCH,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
  SYNC_FAILED_MARKER,
  SYNC_PUSH_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { getAttemptFailure } from "#src/services/coderabbit/collect/getAttemptFailure";
import { getMarkedCount } from "#src/services/coderabbit/collect/getMarkedCount";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getSyncPrompt } from "#src/services/coderabbit/collect/getSyncPrompt";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { reshapeQueue } from "#src/services/coderabbit/collect/reshapeQueue";
import { resolveLockfileConflicts } from "#src/services/coderabbit/collect/resolveLockfileConflicts";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { readEntries } from "#src/services/coderabbit/shared/readEntries";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

// One sequence rather than a pick per commit: a stop is resumed by `--continue`, and a copy the tree already
// Holds drops on its own. Whether the sequence ran to its end — a stop leaves it open for the resolver. `-x`
// Names the original in every copy it lands, which is the one record a resolution that drifted the copy's patch
// Id cannot lose (`readCherryShas`), and so the one thing `checkIsCarried` can read the replay against.
const checkIsPicked = (shas: string[], cwd: string): boolean =>
  shas.length === 0 ||
  getResult(() => runGit(["cherry-pick", "-x", "--empty=drop", ...shas], cwd)).match(
    () => true,
    () => false,
  );

// Whether the replay carries every commit the queue owed — by patch id, or by a copy naming it as its original.
// A closed sequencer over a clean tree says only that nothing is mid-flight: `git cherry-pick --abort` leaves
// Exactly that, with the replay reset to the target and every owed commit about to be force-pushed away, as does
// A `--skip` of a commit the target does not carry. This is the test that reads the work rather than the state
// It was left in.
const checkIsCarried = (queueSha: string, cwd: string): boolean =>
  readCherryShas(readHeadSha(cwd), queueSha, cwd).length === 0;

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
    const owedShas = readCherryShas(targetSha, queueSha, cwd);
    console.info(
      `sync: ${QUEUE_BRANCH} sits behind ${targetBranch} — replaying the ${owedShas.length} commits it owes`,
    );
    runGit(["switch", "--detach", targetSha], cwd);
    if (!checkIsPicked(owedShas, cwd)) {
      const abort = (stoppedSha: string, reason: string): string => {
        runGit(["cherry-pick", "--abort"], cwd);
        console.info(`sync: ${stoppedSha} conflicts with ${targetBranch} — ${reason}`);
        return queueSha;
      };
      if (isDryRun) return abort(readSha("CHERRY_PICK_HEAD", cwd) ?? "", "a dry run resolves nothing");
      // The lockfile is the one conflict a replay of this queue almost always brings, and it is rebuilt rather
      // Than resolved (`git` skill) — so the sequence is run out over as many commits as stop on that path
      // Alone, and only a stop on another path is worth a session (`llm-delegation` skill)
      if (!resolveLockfileConflicts(cwd, owedShas.length)) {
        const conflictSha = readSha("CHERRY_PICK_HEAD", cwd) ?? "";
        const conflictedPaths = readUnmergedPaths(cwd);
        // The attempts are counted on the commit itself: the queue is synced with no pull request open as often
        // As with one, and a count kept on the pull request would leave the resolver uncapped in between
        const marker = getMarker(SYNC_FAILED_MARKER, conflictSha);
        const comments = readEntries<GitHubEntry>(`commits/${conflictSha}/comments`);
        const attempts = getMarkedCount(comments, viewerLogin, marker);
        if (attempts >= SESSION_ATTEMPT_CAP)
          return abort(conflictSha, `its resolution failed ${attempts} times, so it is a person's`);

        const prompt = getSyncPrompt({ conflictedPaths, conflictSha, targetBranch });
        const { isEnded, isStarted } = await runSession({
          cwd,
          model: SessionRoleModelMap[SessionRole.Sync],
          prompt,
        });
        if (!isStarted) return abort(conflictSha, "the resolver could not start, and no attempt is counted");
        // A clean exit says the session ended, never how it ended; what proves the resolution is a sequence run
        // To its end over a clean tree, carrying every commit the queue owed. Anything else fails the run as a
        // Drain does, with the attempt counted on the commit
        else if (
          !isEnded ||
          checkIsSequencing(cwd) ||
          readDirtyPaths(cwd).length > 0 ||
          !checkIsCarried(queueSha, cwd)
        ) {
          postCommitComment(
            conflictSha,
            getAttemptFailure({
              attempts,
              marker,
              task: `resolve the conflict ${conflictSha} brings to ${targetBranch}`,
            }),
          );
          throw new InvalidOperationError(
            Operation.Update,
            "coderabbit",
            `the resolver left ${conflictSha} unresolved (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
          );
        }
      }
    }
  }

  const isReshaped = await reshapeQueue({ cwd, isDryRun, targetSha, viewerLogin });
  if (isOnTarget && !isReshaped) return queueSha;
  return pushRewrite(cwd, queueSha, isDryRun);
};
