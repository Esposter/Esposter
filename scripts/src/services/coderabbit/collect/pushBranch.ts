import type { PushBranchInput } from "#src/models/coderabbit/collect/PushBranchInput";

import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

const readRemoteSha = (branch: string, cwd?: string): string | undefined => {
  runGit(["fetch", "origin", branch], cwd);
  return readSha(`origin/${branch}`, cwd);
};

// Every irreversible act the cycle has, in one place, which is what a dry run withholds. A compare-and-swap whose
// Swap is the `--force-with-lease`: the remote refuses the update itself if the branch left the sha every count
// Was measured from, so the read above it is only an early exit. The lease makes the push forced, so the
// Fast-forward git used to refuse is asserted here — a non-descendant target is the porter's bug, not a race —
// Except for a rewrite, whose whole point is a target that does not descend. A rejection is a moved branch only when the ref re-reads as moved; the rejection text is localized.
export const pushBranch = ({ branch, cwd, expectedSha, isDryRun, isRewrite, sha }: PushBranchInput): boolean => {
  if (readRemoteSha(branch, cwd) !== expectedSha) return false;
  else if (isDryRun) {
    console.info(`would push ${sha} to ${branch}`);
    return true;
  }

  if (!isRewrite && !checkIsAncestor(expectedSha, sha, cwd))
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
