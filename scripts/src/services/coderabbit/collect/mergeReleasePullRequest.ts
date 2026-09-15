import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { MergeReleaseInput } from "#src/models/coderabbit/collect/MergeReleaseInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/coderabbit/shared/runGh";

// A release whose review is clean merges itself, and the push to `main` runs the return stroke. `--admin`
// Because the branch rules hold every check `develop` runs and the release does not wait on them: the review
// Is the gate, and a red check is one more commit in the next window. `--match-head-commit` is the same
// Compare-and-swap the push makes (`pushBranch`): every gate above was measured against this head, so a
// `develop` that moved since must be read again rather than released on a verdict that never covered it.
export const mergeReleasePullRequest = ({ developSha, isDryRun, pullRequest }: MergeReleaseInput): CycleOutcome => {
  if (isDryRun) console.info(`would merge pull request #${pullRequest} at ${developSha} into ${MAIN_BRANCH}`);
  else runGh(["pr", "merge", pullRequest.toString(), "--merge", "--admin", "--match-head-commit", developSha]);
  return {
    kind: CycleOutcomeKind.Merged,
    reason: `pull request #${pullRequest} merged — the push to ${MAIN_BRANCH} runs the return stroke`,
  };
};
