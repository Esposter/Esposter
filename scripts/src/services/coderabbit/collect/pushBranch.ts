import type { PushBranchInput } from "#src/models/coderabbit/collect/PushBranchInput";

import { runGit } from "#src/services/coderabbit/shared/runGit";

// Every irreversible act the cycle has, in one place — which is the whole of what a dry run has to withhold.
// The push is never forced, so a branch that moved between the read and the write refuses the update rather than
// Losing it, and the run reports what it would have done instead of what it did.
export const pushBranch = ({ branch, cwd, isDryRun, sha }: PushBranchInput): void => {
  if (isDryRun) {
    console.info(`would push ${sha} to ${branch}`);
    return;
  }

  runGit(["push", "origin", `${sha}:refs/heads/${branch}`], cwd);
  console.info(`pushed ${sha} to ${branch}`);
};
