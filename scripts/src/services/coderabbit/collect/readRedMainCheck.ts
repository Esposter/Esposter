import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

import {
  CI_FAILURE_CONCLUSION,
  MAIN_BRANCH,
  MAIN_CHECK_WORKFLOW_FILES,
} from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/shared/runGh";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

const readMainCheck = (workflowFile: string, mainSha: string): MainCheck | undefined =>
  parseMachineJson<MainCheck[]>(
    runGh([
      "run",
      "list",
      "--workflow",
      workflowFile,
      "--branch",
      MAIN_BRANCH,
      "--commit",
      mainSha,
      "--limit",
      "1",
      "--json",
      "conclusion,databaseId,status,url",
    ]),
  ).at(0);

// The red run on `main`'s head, if any — the newest run of each workflow whose verdict the repairer answers,
// Read on every pass because the event that reports it (`workflow_run`) fires only from the copy of the trigger
// `main` carries. A run still going or cancelled is not a red.
export const readRedMainCheck = (mainSha: string): MainCheck | undefined =>
  MAIN_CHECK_WORKFLOW_FILES.map((workflowFile) => readMainCheck(workflowFile, mainSha)).find(
    (check) => check?.conclusion === CI_FAILURE_CONCLUSION,
  );
