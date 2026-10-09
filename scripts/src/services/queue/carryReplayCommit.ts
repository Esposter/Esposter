import { SessionRole } from "#src/models/coderabbit/collect/SessionRole";
import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { SessionRoleModelMap } from "#src/services/coderabbit/collect/constants";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { resolveLockfileConflicts } from "#src/services/coderabbit/collect/resolveLockfileConflicts";
import { runSession } from "#src/services/coderabbit/collect/runSession";
import { getCarryPrompt } from "#src/services/queue/getCarryPrompt";
import { pickCommit } from "#src/services/queue/pickCommit";
import { getResultAsync } from "@esposter/shared";

// One headless session settles the stopped pick. Anything but a session that started and exited clean counts as not
// Settled — a failure, a refusal to start and a limit alike — so the push waits as it did before sessions settled it
const runCarrySession = async (conflictSha: string, cwd: string): Promise<boolean> => {
  const prompt = getCarryPrompt(conflictSha, readUnmergedPaths(cwd));
  const result = await getResultAsync(() => runSession({ cwd, model: SessionRoleModelMap[SessionRole.Carry], prompt }));
  return result.match(
    ({ isEnded, isStarted }) => isStarted && isEnded,
    (error) => {
      console.error(error);
      return false;
    },
  );
};

// Whether the pick is settled as exactly one new commit on top of `before`, over a clean tree with nothing in progress.
// An abort or a skip leaves HEAD where it was, and a session's clean exit proves nothing on its own
const checkIsCarried = (before: string, cwd: string): boolean =>
  !checkIsSequencing(cwd) && readDirtyPaths(cwd).length === 0 && readSha("HEAD^", cwd) === before;

// Carries one commit onto the replay at `cwd`, the throwaway worktree of `pnpm ai:queue:push`. A pick that stops is
// Settled first by the lockfile rebuild, the one conflict a replay almost always brings (`resolveLockfileConflicts`),
// And otherwise by one headless session. Returns false when neither settles it; the worktree is then removed with the
// Pick still open, so nothing reaches the remote
export const carryReplayCommit = async (commit: string, cwd: string): Promise<boolean> => {
  const before = readHeadSha(cwd);
  if (pickCommit(commit, cwd)) return true;
  // A stop with no pick in progress failed before it began, and there is nothing for a session to resolve
  if (readSha("CHERRY_PICK_HEAD", cwd) === undefined) return false;

  const isSettled = resolveLockfileConflicts(cwd, 1) || (await runCarrySession(commit, cwd));
  if (isSettled && checkIsCarried(before, cwd)) return true;

  console.info(`the replay stopped on ${commit}, which no session settled`);
  return false;
};
