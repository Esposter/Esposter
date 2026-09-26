import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { MergeReleaseInput } from "#src/models/coderabbit/collect/MergeReleaseInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/shared/runGh";

// A release merges the moment its one review completes, whatever the review found: the findings are drained after
// The merge and lead the next window. `--admin` because the branch rules hold every check `develop` runs and the
// Release does not wait on them. `--match-head-commit` is the same compare-and-swap the push makes
// (`pushBranch`): a `develop` that moved since the review read it is never released on that review.
export const mergeReleasePullRequest = ({ developSha, isDryRun, pullRequest }: MergeReleaseInput): CycleOutcome => {
  if (isDryRun) console.info(`would merge pull request #${pullRequest} at ${developSha} into ${MAIN_BRANCH}`);
  else runGh(["pr", "merge", pullRequest.toString(), "--merge", "--admin", "--match-head-commit", developSha]);
  return {
    kind: CycleOutcomeKind.Merged,
    reason: `pull request #${pullRequest} merged — the push to ${MAIN_BRANCH} runs the return stroke, and the next run drains its findings`,
  };
};
