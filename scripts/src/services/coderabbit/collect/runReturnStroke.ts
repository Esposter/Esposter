import type { ReturnStrokeInput } from "#src/models/coderabbit/collect/ReturnStrokeInput";
import type { ReturnStrokeResult } from "#src/models/coderabbit/collect/ReturnStrokeResult";

import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";

// `main` is ahead and `develop` has nothing of its own, so it follows by fast-forward. What moved `main` is not
// Asked — a release that merged, an express cut and a bump pushed straight at it all arrive in this shape, and all
// Already sit on the branch a window is diffed against, so no window could carry them to a review, while refusing
// One would strand `develop` behind `main` and close the express lane. Divergence is the porter's case instead.
// The stroke spends nothing — no pull request is open — so the pass goes on measuring against the `develop` it
// Made: a push to `develop` fires no run, and a run that ended here would leave the queue waiting on the next
// Session push for the window it could have cut now.
export const runReturnStroke = ({ cwd, developSha, isDryRun, mainSha }: ReturnStrokeInput): ReturnStrokeResult => {
  // Equal first: `--is-ancestor` is reflexive, and a branch is nothing to carry to itself
  if (developSha === mainSha || !checkIsAncestor(developSha, mainSha, cwd)) return { developSha };

  console.info(`${DEVELOP_BRANCH} is an ancestor of ${MAIN_BRANCH} — fast-forwarding it`);
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, sha: mainSha }))
    return { developSha, outcome: getMovedOutcome(DEVELOP_BRANCH) };
  console.info(`${DEVELOP_BRANCH} followed ${MAIN_BRANCH} — the pass measures against it`);
  return { developSha: mainSha };
};
