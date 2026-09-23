import { checkIsSequencing } from "#src/services/coderabbit/collect/checkIsSequencing";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// Every operation that leaves a head or a sequencer behind, in the order a collector step meets them: its own
// Replay first, then whatever a session ran instead
const ABORT_COMMANDS: string[] = ["cherry-pick", "merge", "rebase"];
// Clears whatever git still holds open, whichever operation opened it. A session told to repackage a commit may
// Leave a merge or a rebase where the step that hands the work out left a cherry-pick, and `--abort` for the
// Wrong one does nothing — while a `git switch` run over any of them refuses, which would lose the record of the
// Failed attempt the caller writes after it.
export const abortSequencing = (cwd?: string): void => {
  for (const command of ABORT_COMMANDS) {
    if (!checkIsSequencing(cwd)) return;
    getResult(() => runGit([command, "--abort"], cwd)).unwrapOr("");
  }
};
