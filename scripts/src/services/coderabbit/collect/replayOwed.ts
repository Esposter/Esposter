import type { CommitAttempts } from "#src/models/coderabbit/collect/CommitAttempts";
import type { ReplayInput } from "#src/models/coderabbit/collect/ReplayInput";

import { AttemptFailedError } from "#src/models/coderabbit/collect/AttemptFailedError";
import { ReplayOutcome } from "#src/models/coderabbit/collect/ReplayOutcome";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { checkIsPicked } from "#src/services/coderabbit/collect/checkIsPicked";
import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import {
  JOB_STARTED_AT_ENVIRONMENT_VARIABLE,
  SESSION_ATTEMPT_CAP,
  SessionRoleModelMap,
  SYNC_FAILED_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { getSyncPrompt } from "#src/services/coderabbit/collect/getSyncPrompt";
import { parkCommits } from "#src/services/coderabbit/collect/parkCommits";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readCommitAttempts } from "#src/services/coderabbit/collect/readCommitAttempts";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readRefusedPaths } from "#src/services/coderabbit/collect/readRefusedPaths";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { restoreResolutions } from "#src/services/coderabbit/collect/restoreResolutions";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { saveResolutions } from "#src/services/coderabbit/collect/saveResolutions";
import { skipStops } from "#src/services/coderabbit/collect/skipStops";
import { withoutHooksAsync } from "#src/services/coderabbit/collect/withoutHooks";
import { runGit } from "#src/services/shared/runGit";
import { getResult, noop } from "@esposter/shared";

// Whether the replay carries every commit the source owed — by patch id, or by a copy naming it as its original.
// A closed sequencer over a clean tree says only that nothing is mid-flight: `git cherry-pick --abort` leaves
// Exactly that, with the replay reset to the target and every owed commit about to be force-pushed away, as does
// A `--skip`. This is the test that reads the work rather than the state it was left in — and the reason the
// Resolver is denied `--skip` outright, and the replay `--empty=keep`: a commit the target absorbs whole lands
// As an empty copy naming its original, because no test over content can tell that drop from an abandoned one,
// While the copy says which it was (`getSyncPrompt`, `checkIsPicked`). The one skip it allows is the collector's own
// Of a parked commit, which its held branch takes out of the owed set first (`readCherryShas`).
const checkIsCarried = (sourceSha: string, cwd: string): boolean =>
  readCherryShas(readHeadSha(cwd), sourceSha, cwd).length === 0;
// A pick git refused leaves the sequence open with nothing in progress, so no conflict can be resolved; it is named by
// the paths git refused over rather than read as a conflict the resolver left unresolved
const throwIfRefused = (cwd: string): void => {
  const refusedPaths = readRefusedPaths(cwd);
  if (refusedPaths.length > 0)
    throw new AttemptFailedError(
      `git refused the next pick over ${refusedPaths.join(", ")}, which differ from HEAD with no pick in progress`,
    );
};
// Whether the sequence has moved past a stopped commit and carries it: run to its end over a clean tree, or stopped on
// A later commit — whose conflict leaves the tree dirty, and is the next session's
const checkIsPast = (stoppedSha: string, cwd: string): boolean => {
  const nextSha = readSha("CHERRY_PICK_HEAD", cwd);
  const isMovedOn = checkIsSequencing(cwd)
    ? nextSha !== undefined && nextSha !== stoppedSha
    : readDirtyPaths(cwd).length === 0;
  return isMovedOn && checkIsCarried(stoppedSha, cwd);
};
// The commits a branch still owes its target, replayed in order onto the target's tree. Both rewritten branches go
// Through here — the fixes onto develop, the queue onto the fixes — so a branch left on a base that has since moved
// Is met once rather than failing every port. A stop on the lockfile alone is rebuilt, one a recorded resolution
// Settles is continued, a stop on a commit whose resolution failed past the attempt cap is parked on its held branch
// And skipped so the rest still lands, and every other stop goes to a session of its own, which resolves that one
// Commit. A session per conflict rather than one for the whole sequence: a replay of hundreds of owed commits meets
// Dozens of conflicts, which no one session's deadline holds, and its failure would be counted on the first conflict
// Whichever one it died on — parking a commit whose resolution had landed.
const replayCommits = async ({
  branch,
  collectorSha,
  cwd,
  isDryRun,
  sourceSha,
  targetBranch,
  targetSha,
  viewerLogin,
}: ReplayInput): Promise<ReplayOutcome> => {
  const owedShas = readCherryShas(targetSha, sourceSha, cwd);
  console.info(`sync: ${branch} sits behind ${targetBranch} — replaying the ${owedShas.length} commits it owes`);
  // Only the job's budget cuts a replay short, and only its checkout is the collector's own to clear, so the job alone
  // Keeps its resolutions across runs
  const isResolutionKept = !isDryRun && process.env[JOB_STARTED_AT_ENVIRONMENT_VARIABLE] !== undefined;
  if (isResolutionKept) restoreResolutions({ branch, cwd, targetSha });
  runGit(["switch", "--detach", targetSha], cwd);
  if (checkIsPicked(owedShas, cwd)) return ReplayOutcome.Replayed;
  else if (isDryRun) {
    const stoppedSha = readSha("CHERRY_PICK_HEAD", cwd) ?? "";
    runGit(["cherry-pick", "--abort"], cwd);
    console.info(`sync: ${stoppedSha} conflicts with ${targetBranch} — a dry run resolves nothing`);
    return ReplayOutcome.Aborted;
  }
  // The attempts are counted on the commit itself: the queue is synced with no release open, and a count kept on
  // A merged pull request would restart with every release. Each commit's are read once, since the stop the resolver
  // Gets is the one its attempts kept from being parked
  const commitAttemptsMap = new Map<string, CommitAttempts>();
  const readAttempts = (sha: string): CommitAttempts => {
    const commitAttempts =
      commitAttemptsMap.get(sha) ?? readCommitAttempts({ collectorSha, marker: SYNC_FAILED_MARKER, sha, viewerLogin });
    commitAttemptsMap.set(sha, commitAttempts);
    return commitAttempts;
  };
  // The lockfile is the one conflict a replay of this queue almost always brings, and it is rebuilt rather than
  // Resolved (`git` skill); a commit the resolver failed past its cap is parked, so only a stop on another path with a
  // Turn left is worth a session (`llm-delegation` skill)
  const parkStop = (stoppedSha: string): boolean => {
    const { attempts } = readAttempts(stoppedSha);
    if (attempts < SESSION_ATTEMPT_CAP) return false;

    parkCommits({
      cause: `its conflict with ${targetBranch} failed the resolver ${attempts} times`,
      cwd,
      isDryRun,
      shas: [stoppedSha],
      viewerLogin,
    });
    return true;
  };
  // Every turn lands the commit it stopped on or ends the run, so the replay's own length bounds the loop
  for (;;) {
    const isReplayed = skipStops(cwd, owedShas.length, parkStop);
    // A pick git refused before it started leaves no sequence open, so the stop reads as a run to its end. Only the
    // Carry check says it landed, and a replay that did not carry what it owed falls through to name the state
    if (isReplayed && checkIsCarried(sourceSha, cwd)) return ReplayOutcome.Replayed;
    throwIfRefused(cwd);

    const conflictSha = readSha("CHERRY_PICK_HEAD", cwd) ?? "";
    const conflictedPaths = readUnmergedPaths(cwd);
    const { attempts, recordAttempt, recordFailure } = readAttempts(conflictSha);
    const prompt = getSyncPrompt({ branch, conflictedPaths, conflictSha, targetBranch });
    // oxlint-disable-next-line no-await-in-loop -- each conflict is met only once the session before it landed its own
    const { isEnded } = await runSession({ cwd, model: SessionRoleModelMap[SessionRole.Sync], prompt });
    // A clean exit says the session ended, never how it ended; what proves the resolution is the sequence moved past
    // The commit and carrying it. Anything else ends the run as a drain does, with the attempt counted on the commit
    if (!isEnded || !checkIsPast(conflictSha, cwd)) {
      throwIfRefused(cwd);
      recordFailure(`resolve the conflict ${conflictSha} brings to ${targetBranch}`);
      throw new AttemptFailedError(
        `the resolver left ${conflictSha} unresolved (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
      );
    }
    // The resolution reaches the remote only with the rewrite's push, and a refusal on the way there — a park's push,
    // A spent budget, or the rewrite's own — throws the replay away, keeping only what rerere recorded of it. So it is
    // Counted now, and a run that hands the same commit to a session again pays for it against the cap. A rewrite that
    // Lands carries the commit under a new sha, which this count does not follow. The record is best-effort, since a
    // Post that failed must not throw away the resolution it counts
    getResult(() => {
      recordAttempt(`resolved the conflict ${conflictSha} brings to ${targetBranch}`);
    }).match(noop, console.error);
    // Saved as each lands, since the run can end at any later session's budget; a failed save costs the next run only
    // The sessions it would have spared
    if (isResolutionKept)
      getResult(() => {
        saveResolutions({ branch, cwd, targetSha });
      }).match(noop, console.error);
  }
};

// The replay's own git and the sessions it hands a conflict to run with the repository's hooks off, so each commit
// lands as it was picked (`withoutHooks`)
export const replayOwed = (input: ReplayInput): Promise<ReplayOutcome> => withoutHooksAsync(() => replayCommits(input));
