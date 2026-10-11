import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { continueSettledPick } from "#src/services/coderabbit/collect/continueSettledPick";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { resolveLockfileConflicts } from "#src/services/coderabbit/collect/resolveLockfileConflicts";
import { runGit } from "#src/services/shared/runGit";
import { getResult, noop } from "@esposter/shared";

// Runs an open cherry-pick sequence out over the stops no session is spent on: one on the lockfile alone is rebuilt,
// One whose every path a recorded resolution already settled is continued — rerere replays an earlier run's
// Resolution and stages it, so a replay a run's budget cut short resumes past the conflicts it already paid for — and
// One `parkStop` parks is skipped — its commit is on its held branch (`parkCommits`), or is taken for parking before
// Anything is pushed, so the skip loses nothing. The first stop `parkStop` declines is left open, mid-pick, for the
// Caller's resolver. Whether the sequence ran to its end is the answer; every turn lands or skips a commit, so the
// Replay's own length bounds it.
// A sequence left open with no pick in progress is git refusing the next pick over a dirty path it touches. No commit
// Names that stop, so there is nothing to park or resolve: it is left open for the caller to name.
export const skipStops = (cwd: string, turnCount: number, parkStop: (stoppedSha: string) => boolean): boolean => {
  for (let turn = 0; turn < turnCount; turn++) {
    if (resolveLockfileConflicts(cwd, turnCount)) return true;
    const stoppedSha = readSha("CHERRY_PICK_HEAD", cwd);
    if (stoppedSha === undefined) return false;
    else if (readUnmergedPaths(cwd).length === 0) {
      continueSettledPick(cwd);
      continue;
    } else if (!parkStop(stoppedSha)) return false;
    // `--skip` exits non-zero on the next stop as readily as on a failure, so the loop asks the sequencer instead
    getResult(() => runGit(["cherry-pick", "--skip"], cwd)).match(noop, (error) => {
      console.error(error);
    });
  }
  return !checkIsSequencing(cwd);
};
