import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { ReturnStrokeInput } from "#src/models/coderabbit/collect/ReturnStrokeInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { DEVELOP_BRANCH, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getResult } from "@esposter/shared";

// The return stroke, as one step of the cycle: the release pull request just merged, so `develop` is an ancestor
// Of `main` and follows it by fast-forward — no slot spent, since no pull request is open. `main` advancing on
// Its own (a dependency bump) leaves `develop` no ancestor, and the porter folds that into the next window
// Instead. The push is the run's one irreversible act, so a stroke that pushed ends the run: with `develop` and
// `main` now agreeing the express lane is open, and taking it here would make two pushes of one run. It waits for
// The next event, and a mechanical commit is never the urgent one. No outcome means there was nothing to carry.
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
