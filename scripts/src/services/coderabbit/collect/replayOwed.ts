import type { CommitAttempts } from "#src/models/coderabbit/collect/CommitAttempts";
import type { ReplayInput } from "#src/models/coderabbit/collect/ReplayInput";

import { AttemptFailedError } from "#src/models/coderabbit/collect/AttemptFailedError";
import { ReplayOutcome } from "#src/models/coderabbit/collect/ReplayOutcome";
import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { checkIsPicked } from "#src/services/coderabbit/collect/checkIsPicked";
import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import {
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
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { skipStops } from "#src/services/coderabbit/collect/skipStops";
import { runGit } from "#src/services/shared/runGit";

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
// The commits a branch still owes its target, replayed in order onto the target's tree. Both rewritten branches go
// Through here — the fixes onto develop, the queue onto the fixes — so a branch left on a base that has since moved
// Is met once rather than failing every port. A stop on the lockfile alone is rebuilt, a stop on a commit whose
// Resolution failed past the attempt cap is parked on its held branch and skipped so the rest still lands, and the
// First other stop goes to the drain's own session, which runs the sequence to its end.
export const replayOwed = async ({
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
  const isReplayed = skipStops(cwd, owedShas.length, (stoppedSha) => {
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
  });
  if (isReplayed) return ReplayOutcome.Replayed;

  const conflictSha = readSha("CHERRY_PICK_HEAD", cwd) ?? "";
  const conflictedPaths = readUnmergedPaths(cwd);
  const { attempts, recordFailure } = readAttempts(conflictSha);
  const prompt = getSyncPrompt({ branch, conflictedPaths, conflictSha, targetBranch });
  const { isEnded } = await runSession({ cwd, model: SessionRoleModelMap[SessionRole.Sync], prompt });
  // A clean exit says the session ended, never how it ended; what proves the resolution is a sequence run
  // To its end over a clean tree, carrying every commit the source owed. Anything else ends the run as a
  // Drain does, with the attempt counted on the commit
  if (!isEnded || checkIsSequencing(cwd) || readDirtyPaths(cwd).length > 0 || !checkIsCarried(sourceSha, cwd)) {
    recordFailure(`resolve the conflict ${conflictSha} brings to ${targetBranch}`);
    throw new AttemptFailedError(
      `the resolver left ${conflictSha} unresolved (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
    );
  }
  return ReplayOutcome.Replayed;
};
