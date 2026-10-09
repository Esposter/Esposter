import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

import {
  CI_COMPLETED_STATUS,
  CI_FAILURE_CONCLUSION,
  MAIN_CHECK_WORKFLOW_FILES,
} from "#src/services/coderabbit/collect/constants";
import { readCommitCheck } from "#src/services/coderabbit/collect/readCommitCheck";
import { readSameTreeParentSha } from "#src/services/coderabbit/collect/readSameTreeParentSha";

// Every red run on `main`'s head — the newest run of each workflow whose verdict the repairer answers, each judged on
// Its own (`settleRedChecks`), so one workflow's red the queue heals never hides another's it does not. Read on every
// Pass because the event that reports it (`workflow_run`) fires only from the copy of the trigger `main` carries. A
// Run still going or cancelled is not a red. Until the head's own run concludes, the reviewed head's stands in for
// It, so a release that merged red is repaired by the cycle its merge fires rather than one CI run later.
export const readRedMainChecks = (mainSha: string, cwd: string): MainCheck[] => {
  const reviewedSha = readSameTreeParentSha(mainSha, cwd);
  return MAIN_CHECK_WORKFLOW_FILES.map((workflowFile) => {
    const check = readCommitCheck(workflowFile, mainSha);
    if (check?.status === CI_COMPLETED_STATUS || reviewedSha === undefined) return check;
    else return readCommitCheck(workflowFile, reviewedSha);
  }).filter((check): check is MainCheck => check?.conclusion === CI_FAILURE_CONCLUSION);
};
