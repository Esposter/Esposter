import type { PushBranchInput } from "#src/models/coderabbit/collect/PushBranchInput";

import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

const readRemoteSha = (branch: string, cwd?: string): string => {
  runGit(["fetch", "origin", branch], cwd);
  return runGit(["rev-parse", "--verify", "--quiet", `origin/${branch}`], cwd).trim();
};

// Every irreversible act the cycle has, in one place — which is the whole of what a dry run has to withhold.
// It is a compare-and-swap, and `--force-with-lease` is where the swap happens: the sha every count was measured
// From is handed to the remote, which refuses the update itself if the branch no longer sits on it. There is
// Therefore no gap for a concurrent push to land in, and the read above it is only an early exit — what the dry
// Run reports on, and what saves a push already known to be stale.
//
// The lease is what makes the push forced, so the fast-forward git used to refuse for free is asserted here
// Instead: a target that is not a descendant of the sha it was built on is the porter's bug rather than a race,
// And it throws rather than rewriting `develop` or `main`. Only a lost lease reads as a moved branch, and the
// Ref is re-read to decide that rather than the rejection text, which git localizes — anything else (no
// Network, no credential) has to fail the run as itself instead of as a branch nobody moved.
export const pushBranch = ({ branch, cwd, expectedSha, isDryRun, sha }: PushBranchInput): boolean => {
  if (readRemoteSha(branch, cwd) !== expectedSha) return false;
  else if (isDryRun) {
    console.info(`would push ${sha} to ${branch}`);
    return true;
  }

  // `--is-ancestor` is reflexive, so a target equal to the expected sha passes as the no-op it is
  const isFastForward = getResult(() => runGit(["merge-base", "--is-ancestor", expectedSha, sha], cwd)).match(
    () => true,
    () => false,
  );
  if (!isFastForward)
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `${sha} is not a descendant of ${branch} at ${expectedSha}`,
    );

  return getResult(() =>
    runGit(
      ["push", `--force-with-lease=refs/heads/${branch}:${expectedSha}`, "origin", `${sha}:refs/heads/${branch}`],
      cwd,
    ),
  ).match(
    () => {
      console.info(`pushed ${sha} to ${branch}`);
      return true;
    },
    (error) => {
      if (readRemoteSha(branch, cwd) === expectedSha) throw error;
      console.info(`${branch} moved while the push was in flight — nothing pushed`);
      return false;
    },
  );
};
