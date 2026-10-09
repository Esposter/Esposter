import type { ExpressLaneInput } from "#src/models/coderabbit/collect/ExpressLaneInput";
import type { ExpressLaneResult } from "#src/models/coderabbit/collect/ExpressLaneResult";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { portExpress } from "#src/services/coderabbit/collect/portExpress";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readClaimedShas } from "#src/services/coderabbit/collect/readClaimedShas";
import { settleUnappliedClaims } from "#src/services/coderabbit/collect/settleUnappliedClaims";

// Build the cut and push it to `main` unverified. A gate here is a blocker with no end: a claimed commit whose own
// Checks are red is often made green by the next commit, which the window cannot carry without the claimed one, so
// Verifying the cut held both lanes forever. An intermediate red `main` is the repairer's, which is how every red
// Resolves eventually. A push is the run's one irreversible act, so a lane that pushed ends the run. The cut goes
// Even over a red `main`, since a claimed commit may be the repair and it reaches `main` this way alone; whether
// `main` is red is asked after it, once the stack has been walked or, in a run marked for it, before (`runRepairStep`).
export const runExpressLane = ({
  collectorSha,
  cwd,
  isDryRun,
  viewerLogin,
  ...expressInput
}: ExpressLaneInput): ExpressLaneResult => {
  const { mainSha } = expressInput;
  const claimedShas = readClaimedShas({ cwd, ...expressInput });
  const cut = claimedShas.length === 0 ? undefined : portExpress({ cwd, mainSha, shas: claimedShas });
  // A claimed commit whose patch did not apply waits on the unported work it needs — the next window may carry that
  // Work, or carry the claimed commit itself when a later commit builds on it — until its attempts run out
  const waitingShas = settleUnappliedClaims({
    collectorSha,
    cwd,
    isDryRun,
    mainSha,
    shas: claimedShas.filter((sha) => !cut?.shas.includes(sha)),
    viewerLogin,
  });
  if (cut?.targetSha === undefined) return { heldShas: waitingShas };

  console.info(`express: ${cut.shas.length} commits claim nothing in them to review`);
  // A dry run reports the cut and carries on rather than ending here: nothing it does is irreversible, so the
  // One pass is worth every stage's decision — the cut, the reshaping, the window — instead of only the first
  if (isDryRun) {
    console.info(`express: would push ${cut.targetSha} to ${MAIN_BRANCH}`);
    return { heldShas: waitingShas };
  } else if (!pushBranch({ branch: MAIN_BRANCH, cwd, expectedSha: mainSha, isDryRun, sha: cut.targetSha }))
    return { heldShas: claimedShas, outcome: getMovedOutcome(MAIN_BRANCH) };
  return {
    heldShas: [],
    outcome: {
      kind: CycleOutcomeKind.Expressed,
      reason: `${cut.shas.length} express commits reached ${MAIN_BRANCH}`,
      targetSha: cut.targetSha,
    },
  };
};
