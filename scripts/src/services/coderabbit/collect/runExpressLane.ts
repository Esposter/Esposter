import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { ExpressLaneInput } from "#src/models/coderabbit/collect/ExpressLaneInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { EXPRESS_VERIFY_COMMANDS, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { portExpress } from "#src/services/coderabbit/collect/portExpress";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";

// Build the cut, prove it, verify it, push it to `main`. `main` is production and CI is the only gate these
// Commits get, so the cut earns the checks CI would fail it on; a red one takes the review lane instead. A push
// Is the run's one irreversible act, so a lane that pushed ends the run.
export const runExpressLane = ({ cwd, isDryRun, ...expressInput }: ExpressLaneInput): CycleOutcome | undefined => {
  const { shas, targetSha } = portExpress({ cwd, ...expressInput });
  if (targetSha === undefined) return undefined;

  console.info(`express: ${shas.length} mechanical commits, nothing in them to review`);
  if (isDryRun)
    return { kind: CycleOutcomeKind.Expressed, reason: `would verify and push to ${MAIN_BRANCH}`, targetSha };
  else if (
    !EXPRESS_VERIFY_COMMANDS.every((args) => {
      console.info(`verify: pnpm ${args.join(" ")}`);
      return spawnPnpm(args, { cwd, stdio: "inherit" }).status === 0;
    })
  ) {
    console.info("the express cut is red — it takes the review lane instead");
    return undefined;
  } else if (!pushBranch({ branch: MAIN_BRANCH, cwd, expectedSha: expressInput.mainSha, isDryRun, sha: targetSha }))
    return getMovedOutcome(MAIN_BRANCH);
  return {
    kind: CycleOutcomeKind.Expressed,
    reason: `${shas.length} mechanical commits reached ${MAIN_BRANCH}`,
    targetSha,
  };
};
