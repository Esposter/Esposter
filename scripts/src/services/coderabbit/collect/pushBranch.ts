import type { PushBranchInput } from "#src/models/coderabbit/collect/PushBranchInput";

import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

// `ls-remote` answers a branch the remote does not have with nothing, where a fetch of it would fail the run: a window
// Branch is read before it exists, so its first push is a push that must not find one
const readRemoteSha = (branch: string, cwd?: string): string | undefined => {
  const remoteRef = `refs/heads/${branch}`;
  const remoteLine = getNonEmptyLines(runGit(["ls-remote", "--heads", "origin", remoteRef], cwd)).find((line) =>
    line.endsWith(`\t${remoteRef}`),
  );
  if (remoteLine === undefined) return undefined;
  runGit(["fetch", "origin", branch], cwd);
  return readSha(`origin/${branch}`, cwd);
};
// Every irreversible act the cycle has, in one place, which is what a dry run withholds. A compare-and-swap whose
// Swap is the `--force-with-lease`: the remote refuses the update itself if the branch left the sha every count
// Was measured from, so the read above it is only an early exit. The lease makes the push forced, so the
// Fast-forward git used to refuse is asserted here — a non-descendant target is the porter's bug, not a race —
// Except for a rewrite, whose whole point is a target that does not descend. A rejection is a moved branch only
// When the ref re-reads as moved; the rejection text is localized
export const pushBranch = ({ branch, cwd, expectedSha, isDryRun, isRewrite, sha }: PushBranchInput): boolean => {
  if (readRemoteSha(branch, cwd) !== expectedSha) return false;
  else if (isDryRun) {
    console.info(`would push ${sha} to ${branch}`);
    return true;
  }

  if (!isRewrite && expectedSha !== undefined && !checkIsAncestor(expectedSha, sha, cwd))
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `${sha} is not a descendant of ${branch} at ${expectedSha}`,
    );

  // A lease with an empty expectation is one git reads as "the branch must not exist yet": a new window's first push
  return getResult(() =>
    runGit(
      ["push", `--force-with-lease=refs/heads/${branch}:${expectedSha ?? ""}`, "origin", `${sha}:refs/heads/${branch}`],
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
