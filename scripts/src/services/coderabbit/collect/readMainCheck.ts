import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

import { CI_WORKFLOW_FILE, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/coderabbit/shared/runGh";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// CI's newest run for `main`'s head — the one fact that says the branch is red, read on every pass because the
// Event that reports it (`workflow_run`) fires only from the copy of the trigger `main` carries
export const readMainCheck = (mainSha: string): MainCheck | undefined =>
  parseMachineJson<MainCheck[]>(
    runGh([
      "run",
      "list",
      "--workflow",
      CI_WORKFLOW_FILE,
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
