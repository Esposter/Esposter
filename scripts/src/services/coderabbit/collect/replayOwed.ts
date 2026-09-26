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
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readCommitAttempts } from "#src/services/coderabbit/collect/readCommitAttempts";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { resolveLockfileConflicts } from "#src/services/coderabbit/collect/resolveLockfileConflicts";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { runGit } from "#src/services/shared/runGit";

// Whether the replay carries every commit the source owed — by patch id, or by a copy naming it as its original.
// A closed sequencer over a clean tree says only that nothing is mid-flight: `git cherry-pick --abort` leaves
// Exactly that, with the replay reset to the target and every owed commit about to be force-pushed away, as does
// A `--skip`. This is the test that reads the work rather than the state it was left in — and the reason the
// Resolver is denied `--skip` outright, and the replay `--empty=keep`: a commit the target absorbs whole lands
// As an empty copy naming its original, because no test over content can tell that drop from an abandoned one,
// While the copy says which it was (`getSyncPrompt`, `checkIsPicked`).
const checkIsCarried = (sourceSha: string, cwd: string): boolean =>
  readCherryShas(readHeadSha(cwd), sourceSha, cwd).length === 0;
// The commits a branch still owes its target, replayed in order onto the target's tree, with a stop handed to the
// Drain's own session. Both rewritten branches go through here — the fixes onto develop, the queue onto the fixes —
// So a branch left on a base that has since moved is met once, by a resolver, rather than failing every port
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

  const abort = (stoppedSha: string, reason: string, outcome: ReplayOutcome): ReplayOutcome => {
    runGit(["cherry-pick", "--abort"], cwd);
    console.info(`sync: ${stoppedSha} conflicts with ${targetBranch} — ${reason}`);
    return outcome;
  };
  if (isDryRun)
    return abort(readSha("CHERRY_PICK_HEAD", cwd) ?? "", "a dry run resolves nothing", ReplayOutcome.Aborted);
  // The lockfile is the one conflict a replay of this queue almost always brings, and it is rebuilt rather
  // Than resolved (`git` skill) — so the sequence is run out over as many commits as stop on that path
  // Alone, and only a stop on another path is worth a session (`llm-delegation` skill)
  else if (resolveLockfileConflicts(cwd, owedShas.length)) return ReplayOutcome.Replayed;

  const conflictSha = readSha("CHERRY_PICK_HEAD", cwd) ?? "";
  const conflictedPaths = readUnmergedPaths(cwd);
  // The attempts are counted on the commit itself: the queue is synced with no release open, and a count kept on
  // A merged pull request would restart with every release
  const { attempts, recordFailure } = readCommitAttempts({
    collectorSha,
    marker: SYNC_FAILED_MARKER,
    sha: conflictSha,
    viewerLogin,
  });
  if (attempts >= SESSION_ATTEMPT_CAP)
    return abort(conflictSha, `its resolution failed ${attempts} times, so it is a person's`, ReplayOutcome.Exhausted);

  const prompt = getSyncPrompt({ branch, conflictedPaths, conflictSha, targetBranch });
  const { isEnded, isStarted } = await runSession({ cwd, model: SessionRoleModelMap[SessionRole.Sync], prompt });
  if (!isStarted)
    return abort(conflictSha, "the resolver could not start, and no attempt is counted", ReplayOutcome.Aborted);
  // A clean exit says the session ended, never how it ended; what proves the resolution is a sequence run
  // To its end over a clean tree, carrying every commit the source owed. Anything else ends the run as a
  // Drain does, with the attempt counted on the commit
  else if (!isEnded || checkIsSequencing(cwd) || readDirtyPaths(cwd).length > 0 || !checkIsCarried(sourceSha, cwd)) {
    recordFailure(`resolve the conflict ${conflictSha} brings to ${targetBranch}`);
    throw new AttemptFailedError(
      `the resolver left ${conflictSha} unresolved (attempt ${attempts + 1} of ${SESSION_ATTEMPT_CAP})`,
    );
  }
  return ReplayOutcome.Replayed;
};
