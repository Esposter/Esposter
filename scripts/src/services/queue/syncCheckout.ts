import { QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// Cherry-picks one commit that landed on the branch during the push. A pick that stops is aborted, so the branch is
// Left at the commit before it. A `-x` line is not added: it would name a sha the remote never held.
const carryCommit = (commit: string, cwd: string): boolean => {
  const isCarried = getResult(() => runGit(["cherry-pick", commit], cwd)).match(
    () => true,
    () => false,
  );
  if (!isCarried && readSha("CHERRY_PICK_HEAD", cwd) !== undefined) runGit(["cherry-pick", "--abort"], cwd);
  return isCarried;
};

// Moves the checkout's branch onto `pushed`, the commit the push just carried, then carries on top of it what landed
// On the branch since `base`, the head the replay started from. `--keep` is the only reset that can run over another
// Session's uncommitted work: it moves the branch and updates just the files that differ between the two commits, and
// It refuses rather than overwrite an edit. The reset takes what landed during the push off the branch, so those
// Commits are carried back on top; a pick that conflicts stops the carrying and stays reachable from the reflog.
export const syncCheckout = (pushed: string, base: string, cwd: string): void => {
  // Read before the reset, so the range never depends on the reflog the reset writes
  const head = runGit(["rev-parse", "HEAD"], cwd).trim();
  const isReset = getResult(() => runGit(["reset", "--keep", pushed], cwd)).match(
    () => true,
    () => false,
  );
  if (!isReset) {
    console.info("the checkout's branch waits: the push landed, but git refused the reset over an uncommitted file");
    return;
  }

  const landed = getNonEmptyLines(runGit(["rev-list", "--reverse", `${base}..${head}`], cwd));
  // `find` stops at the first commit that does not carry, which is the one the message names
  const conflicted = landed.find((commit) => !carryCommit(commit, cwd));
  const synced = `synced ${QUEUE_BRANCH} onto ${pushed}`;
  if (conflicted !== undefined) {
    console.info(
      `${synced}, stopped carrying at ${conflicted}, which does not apply on top of it — it stays in the reflog`,
    );
  } else if (landed.length > 0) {
    console.info(`${synced}, carrying ${landed.length} commit(s) that landed during the push`);
  } else {
    console.info(synced);
  }
};
