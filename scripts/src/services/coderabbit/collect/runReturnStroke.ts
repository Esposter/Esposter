import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { ReturnStrokeInput } from "#src/models/coderabbit/collect/ReturnStrokeInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getResult } from "@esposter/shared";

// `main` is ahead and `develop` has nothing of its own, so it follows by fast-forward. What moved `main` is not
// Asked — a release that merged, an express cut and a bump pushed straight at it all arrive in this shape, and all
// Already sit on the branch a window is diffed against, so no window could carry them to a review, while refusing
// One would strand `develop` behind `main` and close the express lane. Divergence is the porter's case instead.
// A push is the run's one irreversible act, so a stroke that pushed ends the run — the express lane waits for the
// Next event. No outcome means there was nothing to carry.
export const runReturnStroke = ({
  cwd,
  developSha,
  isDryRun,
  mainSha,
}: ReturnStrokeInput): CycleOutcome | undefined => {
  const isDevelopBehindMain =
    developSha !== mainSha &&
    getResult(() => runGit(["merge-base", "--is-ancestor", developSha, mainSha], cwd)).match(
      () => true,
      () => false,
    );
  if (!isDevelopBehindMain) return undefined;

  console.info(`${DEVELOP_BRANCH} is an ancestor of ${MAIN_BRANCH} — fast-forwarding it`);
  if (!pushBranch({ branch: DEVELOP_BRANCH, cwd, expectedSha: developSha, isDryRun, sha: mainSha }))
    return getMovedOutcome(DEVELOP_BRANCH);
  return {
    kind: CycleOutcomeKind.FastForwarded,
    reason: `${DEVELOP_BRANCH} followed ${MAIN_BRANCH} — the next event measures against it`,
    targetSha: mainSha,
  };
};
