import type { SyncFixesInput } from "#src/models/coderabbit/collect/SyncFixesInput";
import type { SyncFixesResult } from "#src/models/coderabbit/collect/SyncFixesResult";

import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { ReplayOutcome } from "#src/models/coderabbit/collect/ReplayOutcome";
import { checkIsAncestor } from "#src/services/coderabbit/collect/checkIsAncestor";
import { DEVELOP_BRANCH, REVIEW_FIXES_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getMovedOutcome } from "#src/services/coderabbit/collect/getMovedOutcome";
import { pushBranch } from "#src/services/coderabbit/collect/pushBranch";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { replayOwed } from "#src/services/coderabbit/collect/replayOwed";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The fixes branch follows develop as the queue follows the fixes: a drain builds on the develop it read, and
// Develop can move before the fixes port — the return stroke, a fold, a repair, a revert — so the fixes are
// Replayed onto it first, a conflict resolved by the same session the queue's gets. Left behind, a fix that no
// Longer applies fails every port with nothing to resolve it, and the window, the queue and the release all wait
export const syncFixes = async ({
  collectorSha,
  cwd,
  developSha,
  isDryRun,
  owingFixesSha,
  viewerLogin,
}: SyncFixesInput): Promise<SyncFixesResult> => {
  if (checkIsAncestor(developSha, owingFixesSha, cwd)) return { owingFixesSha };

  const replayOutcome = await replayOwed({
    branch: REVIEW_FIXES_BRANCH,
    collectorSha,
    cwd,
    isDryRun,
    sourceSha: owingFixesSha,
    targetBranch: DEVELOP_BRANCH,
    targetSha: developSha,
    viewerLogin,
  });
  // Nothing may port ahead of fixes still owed, so a conflict past its cap holds everything behind it for a person
  if (replayOutcome === ReplayOutcome.Exhausted)
    throw new InvalidOperationError(
      Operation.Update,
      "coderabbit",
      `${REVIEW_FIXES_BRANCH} conflicts with ${DEVELOP_BRANCH} past the attempt cap, so a person rebases it (the conflicting fix's commit comments say which)`,
    );
  else if (replayOutcome === ReplayOutcome.Aborted)
    return {
      outcome: {
        kind: CycleOutcomeKind.Idle,
        reason: `${REVIEW_FIXES_BRANCH} conflicts with ${DEVELOP_BRANCH} and nothing resolved it this run — the fixes stay owed`,
      },
      owingFixesSha,
    };

  const syncedSha = readHeadSha(cwd);
  if (
    !pushBranch({
      branch: REVIEW_FIXES_BRANCH,
      cwd,
      expectedSha: owingFixesSha,
      isDryRun,
      isRewrite: true,
      sha: syncedSha,
    })
  )
    return { outcome: getMovedOutcome(REVIEW_FIXES_BRANCH), owingFixesSha };
  return { owingFixesSha: syncedSha };
};
