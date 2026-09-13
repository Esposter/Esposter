import type { PushBranchInput } from "#src/models/coderabbit/collect/PushBranchInput";

import { runGit } from "#src/services/coderabbit/shared/runGit";

// Every irreversible act the cycle has, in one place — which is the whole of what a dry run has to withhold.
// It is a compare-and-swap: a fresh fetch asserts the branch still sits on the sha every count was measured
// From, and a branch that moved between the read and the write is left alone rather than clobbered, the run
// Reporting what it would have done instead of what it did. The push itself is never forced either, so git
// Refuses the update a second time if the ref moves in the gap after the fetch.
export const pushBranch = ({ branch, cwd, expectedSha, isDryRun, sha }: PushBranchInput): boolean => {
  runGit(["fetch", "origin", branch], cwd);
  if (runGit(["rev-parse", "--verify", "--quiet", `origin/${branch}`], cwd).trim() !== expectedSha) return false;
  else if (isDryRun) {
    console.info(`would push ${sha} to ${branch}`);
    return true;
  }

  runGit(["push", "origin", `${sha}:refs/heads/${branch}`], cwd);
  console.info(`pushed ${sha} to ${branch}`);
  return true;
};
