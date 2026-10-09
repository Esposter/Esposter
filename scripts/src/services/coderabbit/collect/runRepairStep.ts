import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";
import type { RepairStepInput } from "#src/models/coderabbit/collect/RepairStepInput";

import { AttemptFailedError } from "#src/models/coderabbit/collect/AttemptFailedError";
import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { checkIsGreen } from "#src/services/coderabbit/collect/checkIsGreen";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readBranchShas } from "#src/services/coderabbit/collect/readBranchShas";
import { repairMain } from "#src/services/coderabbit/collect/repairMain";

// The repair is a pass's last step, after the walk and the openings: its session and checks run up to its deadline,
// And the windows merged and opened before it are reviewed meanwhile rather than waiting on a red `main` that blocks
// No window. `main` is read afresh, since the walk may have merged into it. The repair is a cut of its own, alone: one
// That proved itself green before committing is not put through the same suite again, one that fails it counts
// Against its signature and the run retries a minute later, and one pushed counts too, so a repair that lands and
// Leaves the same jobs red is paid for once rather than on every head it makes. Nothing pushed leaves the pass's own
// Verdict standing.
export const runRepairStep = async (repairStepInput: RepairStepInput): Promise<CycleOutcome | undefined> => {
  const { cwd, isDryRun } = repairStepInput;
  const { mainSha } = readBranchShas(cwd);
  const repair = await repairMain({ ...repairStepInput, mainSha });
  if (repair.targetSha === undefined) return undefined;
  else if (!repair.isVerified && !checkIsGreen(cwd, repair.deadlineMs)) {
    repair.recordFailure(`repair this red ${MAIN_BRANCH} head`, "left a repair that failed the checks as a cut");
    throw new AttemptFailedError(`the repair of ${mainSha} failed the checks as a cut`);
  } else if (!pushBranch({ branch: MAIN_BRANCH, cwd, expectedSha: mainSha, isDryRun, sha: repair.targetSha }))
    return getMovedOutcome(MAIN_BRANCH);

  repair.recordAttempt(`repaired this red ${MAIN_BRANCH} head with ${repair.targetSha}`);
  return {
    kind: CycleOutcomeKind.Repaired,
    reason: `${MAIN_BRANCH} repaired — its push runs the cycle again`,
    targetSha: repair.targetSha,
  };
};
