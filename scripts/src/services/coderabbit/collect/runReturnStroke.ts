import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { ReturnStrokeInput } from "#src/models/coderabbit/collect/ReturnStrokeInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getResult } from "@esposter/shared";

// The return stroke, as one step of the cycle: `main` is ahead and `develop` has nothing of its own, so it
// Follows by fast-forward — no slot spent, since a `develop` that is an ancestor of `main` leaves nothing for a
// Pull request to review. What moved `main` is not asked and could not change the answer: a release that merged,
// An express cut and a bump pushed straight at it all arrive in this shape, and all of them already sit on the
// Branch a window is diffed against, so no window could carry them to a review anyway — while refusing one would
// Strand `develop` behind `main` and close the express lane, which only opens when the two agree. Divergence is
// The porter's case instead — `main` advancing under a `develop` already ahead of it leaves neither an ancestor,
// And the fold rides that into the next window. The push is the run's one irreversible act, so a stroke that
// Pushed ends the run: with `develop` and `main` now agreeing the express lane is open, and taking it here would
// Make two pushes of one run. It waits for the next event, and a mechanical commit is never the urgent one. No
// Outcome means there was nothing to carry.
export const runReturnStroke = ({ developSha, isDryRun, mainSha }: ReturnStrokeInput): CycleOutcome | undefined => {
  const isDevelopBehindMain =
    developSha !== mainSha &&
    getResult(() => runGit(["merge-base", "--is-ancestor", developSha, mainSha])).match(
      () => true,
      () => false,
    );
  if (!isDevelopBehindMain) return undefined;

  console.info(`${DEVELOP_BRANCH} is an ancestor of ${MAIN_BRANCH} — fast-forwarding it`);
  if (!pushBranch({ branch: DEVELOP_BRANCH, expectedSha: developSha, isDryRun, sha: mainSha }))
    return getMovedOutcome(DEVELOP_BRANCH);
  return {
    kind: CycleOutcomeKind.FastForwarded,
    reason: `${DEVELOP_BRANCH} followed ${MAIN_BRANCH} — the next event measures against it`,
    targetSha: mainSha,
  };
};
