import { readSha } from "#src/services/coderabbit/collect/readSha";
import { runGit } from "#src/services/shared/runGit";
import { getResult, noop } from "@esposter/shared";

// Lands a stopped pick whose conflict the index already settles, and runs the sequence on to its next stop. A
// Settlement that leaves the tree as the target had it is refused by `--continue` as nothing to commit, so it is
// Committed empty under the message git prepared, which names the original (`checkIsPicked`), and continued.
// `--continue` exits non-zero on the next stop as readily as on a failure, so the caller reads the sequencer
// Rather than either exit status
export const continueSettledPick = (cwd: string): void => {
  const stoppedSha = readSha("CHERRY_PICK_HEAD", cwd);
  const runReported = (args: string[]): void => {
    // `core.editor` rather than the environment: the message the pick carries is the original's, unedited
    getResult(() => runGit(["-c", "core.editor=true", ...args], cwd)).match(noop, (error) => {
      console.error(error);
    });
  };
  runReported(["cherry-pick", "--continue"]);
  if (readSha("CHERRY_PICK_HEAD", cwd) !== stoppedSha) return;
  runReported(["commit", "--allow-empty"]);
  runReported(["cherry-pick", "--continue"]);
};
