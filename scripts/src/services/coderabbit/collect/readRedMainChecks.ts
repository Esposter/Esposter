import type { RedMainCheck } from "#src/models/coderabbit/collect/RedMainCheck";

import {
  CI_COMPLETED_STATUS,
  CI_FAILURE_CONCLUSION,
  MAIN_BRANCH,
  MAIN_CHECK_WORKFLOW_FILES,
} from "#src/services/coderabbit/collect/constants";
import { readCommitCheck } from "#src/services/coderabbit/collect/readCommitCheck";
import { readSameTreeParentSha } from "#src/services/coderabbit/collect/readSameTreeParentSha";

// Every red run on `main`'s head — the newest run on `main` itself of each workflow whose verdict the repairer answers,
// Each judged on its own (`settleRedChecks`), so one workflow's red the queue heals never hides another's it does not.
// Read on every pass because the event that reports it (`workflow_run`) fires only from the copy of the trigger `main`
// Carries. A run still going or cancelled is not a red. Until the head's own run concludes, the reviewed head's stands
// In for it, so a release that merged red is repaired by the cycle its merge fires rather than one CI run later — but
// Not over a re-run of its failed jobs (`rerunRedCheck`), which is the head's own verdict being asked again
export const readRedMainChecks = (mainSha: string, cwd: string): RedMainCheck[] => {
  const reviewedSha = readSameTreeParentSha(mainSha, cwd);
  return MAIN_CHECK_WORKFLOW_FILES.flatMap((workflowFile) => {
    const headCheck = readCommitCheck(workflowFile, mainSha, MAIN_BRANCH);
    const check =
      headCheck?.status === CI_COMPLETED_STATUS || (headCheck?.attempt ?? 0) > 1 || reviewedSha === undefined
        ? headCheck
        : readCommitCheck(workflowFile, reviewedSha);
    return check?.conclusion === CI_FAILURE_CONCLUSION ? [{ ...check, workflowFile }] : [];
  });
};
