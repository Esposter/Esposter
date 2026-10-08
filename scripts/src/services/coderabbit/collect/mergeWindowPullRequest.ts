import type { MergeWindowInput } from "#src/models/coderabbit/collect/MergeWindowInput";

import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/shared/runGh";

// A window merges once its one review completes, whatever the review found: its findings are drained straight after
// The merge and lead the next window. `--admin` because the branch rules hold every check `develop` runs and a window
// Does not wait on them. `--match-head-commit` is the same compare-and-swap the push makes (`pushBranch`): a head that
// Moved since the review read it is never merged on that review.
export const mergeWindowPullRequest = ({ headSha, isDryRun, pullRequest }: MergeWindowInput): void => {
  if (isDryRun) console.info(`would merge pull request #${pullRequest} at ${headSha} into ${MAIN_BRANCH}`);
  else {
    runGh(["pr", "merge", pullRequest.toString(), "--merge", "--admin", "--match-head-commit", headSha]);
    console.info(`merged pull request #${pullRequest} into ${MAIN_BRANCH}`);
  }
};
