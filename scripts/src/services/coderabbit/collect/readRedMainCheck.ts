import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

import {
  CI_COMPLETED_STATUS,
  CI_FAILURE_CONCLUSION,
  MAIN_CHECK_WORKFLOW_FILES,
} from "#src/services/coderabbit/collect/constants";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";
import { runGit } from "#src/services/shared/runGit";

// A workflow's newest run on a commit, found by the commit alone: GitHub's per-workflow branch filter holds none of
// `develop`'s runs after 2026-09-24 nor `main`'s after April, so a branch narrowing it missed a red that had run
const readCheck = (workflowFile: string, sha: string): MainCheck | undefined =>
  parseMachineJson<MainCheck[]>(
    runGh([
      "run",
      "list",
      "--workflow",
      workflowFile,
      "--commit",
      sha,
      "--limit",
      "1",
      "--json",
      "conclusion,databaseId,status,url",
    ]),
  ).at(0);
// The parent whose tree is the head's own — the reviewed `develop` head a release merged, since the fold left
// `develop` carrying all of `main` — so CI's verdict on it is the head's verdict, already reached during the review
const readSameTreeParentSha = (mainSha: string, cwd: string): string | undefined => {
  const [, ...parentShas] = runGit(["rev-list", "--parents", "--max-count=1", mainSha], cwd).trim().split(" ");
  const treeSha = readSha(`${mainSha}^{tree}`, cwd);
  return parentShas.find((parentSha) => readSha(`${parentSha}^{tree}`, cwd) === treeSha);
};
// The red run on `main`'s head, if any — the newest run of each workflow whose verdict the repairer answers,
// Read on every pass because the event that reports it (`workflow_run`) fires only from the copy of the trigger
// `main` carries. A run still going or cancelled is not a red. Until the head's own run concludes, the reviewed
// Head's stands in for it, so a release that merged red is repaired by the cycle its merge fires rather than one
// CI run later.
export const readRedMainCheck = (mainSha: string, cwd: string): MainCheck | undefined => {
  const reviewedSha = readSameTreeParentSha(mainSha, cwd);
  return MAIN_CHECK_WORKFLOW_FILES.map((workflowFile) => {
    const check = readCheck(workflowFile, mainSha);
    if (check?.status === CI_COMPLETED_STATUS || reviewedSha === undefined) return check;
    else return readCheck(workflowFile, reviewedSha);
  }).find((check) => check?.conclusion === CI_FAILURE_CONCLUSION);
};
