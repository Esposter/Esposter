import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { ExpressLaneInput } from "#src/models/coderabbit/collect/ExpressLaneInput";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { EXPRESS_VERIFY_COMMANDS, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { portExpress } from "#src/services/coderabbit/collect/portExpress";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";

// The express lane as one step of the cycle: build the cut, prove it, verify it, push it to `main`. It spends no
// Review slot and needs no pull request open, which makes it the one thing that moves the pipeline while there
// Is none. `main` is production and CI is the only gate these commits get, so the cut earns the checks CI would
// Fail it on — the tests among them — and a red one is not held back: it simply takes the review lane, where a
// Person reads why. The push is the run's one irreversible act, so a lane that pushed ends the run; the push
// Fires the cycle again, which fast-forwards `develop` onto it and then measures a window against a frontier that
// Has already moved. No outcome means the lane was closed or the cut was red, and the cycle carries on.
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
