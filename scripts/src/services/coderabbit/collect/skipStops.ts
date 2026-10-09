import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { resolveLockfileConflicts } from "#src/services/coderabbit/collect/resolveLockfileConflicts";
import { runGit } from "#src/services/shared/runGit";
import { getResult, noop } from "@esposter/shared";

// Runs an open cherry-pick sequence out over the stops no session is spent on: one on the lockfile alone is rebuilt,
// And one `parkStop` parks is skipped — its commit is on its held branch (`parkCommits`), or is taken for parking
// Before anything is pushed, so the skip loses nothing. The first stop `parkStop` declines is left open, mid-pick, for
// The caller's resolver. Whether the sequence ran to its end is the answer; every turn lands or skips a commit, so the
// Replay's own length bounds it.
export const skipStops = (cwd: string, turnCount: number, parkStop: (stoppedSha: string) => boolean): boolean => {
  for (let turn = 0; turn < turnCount; turn++) {
    if (resolveLockfileConflicts(cwd, turnCount)) return true;
    else if (!parkStop(readSha("CHERRY_PICK_HEAD", cwd) ?? "")) return false;
    // `--skip` exits non-zero on the next stop as readily as on a failure, so the loop asks the sequencer instead
    getResult(() => runGit(["cherry-pick", "--skip"], cwd)).match(noop, (error) => {
      console.error(error);
    });
  }
  return !checkIsSequencing(cwd);
};
