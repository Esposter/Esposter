import { checkIsLockfileOnly } from "#src/services/coderabbit/collect/checkIsLockfileOnly";
import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { readUnmergedPaths } from "#src/services/coderabbit/collect/readUnmergedPaths";
import { rebuildLockfile } from "#src/services/coderabbit/collect/rebuildLockfile";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getResult, noop } from "@esposter/shared";

// A replay of a queue onto a moved base stops on the lockfile once per commit that touched a manifest, and every
// One of those stops has the same answer — so the sequence is run out here rather than handed to a session per
// Commit. Whether it completed is the answer; a stop on anything else leaves the sequencer exactly where the
// Resolver expects to find it, mid-pick with that commit's own conflict open.
//
// `--continue` exits non-zero on the next stop as readily as on a failure, so its status says nothing and is not
// Read: the loop asks the sequencer itself. What bounds it is the replay's own length, since every turn either
// Lands a commit or stops the sequence on a path this cannot answer.
export const resolveLockfileConflicts = (cwd: string, replayedCount: number): boolean => {
  for (let turn = 0; turn < replayedCount; turn++) {
    if (!checkIsSequencing(cwd)) return true;

    const unmergedPaths = readUnmergedPaths(cwd);
    if (!checkIsLockfileOnly(unmergedPaths)) return false;

    rebuildLockfile(cwd);
    // `core.editor` rather than the environment: the message the pick carries is the original's, unedited
    getResult(() => runGit(["-c", "core.editor=true", "cherry-pick", "--continue"], cwd)).match(noop, noop);
  }
  return !checkIsSequencing(cwd);
};
