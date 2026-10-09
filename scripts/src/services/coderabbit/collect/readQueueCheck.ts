import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

import { checkIsVerdict } from "#src/services/coderabbit/collect/checkIsVerdict";
import {
  CHECK_RUN_FIELDS,
  DEVELOP_BRANCH,
  QUEUE_BRANCH,
  QUEUE_CHECK_RUN_LIST_LIMIT,
} from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// A branch's newest run of a workflow that reached a verdict. The branch narrows the list on GitHub's side, so no other
// Branch's runs share it: unfiltered, the Renovate branches each rerunning CI on every move of `main` filled a hundred
// Runs in about an hour and a quarter and pushed the queue's verdict out of the list
const readBranchCheck = (workflowDatabaseId: number, branch: string): MainCheck | undefined =>
  parseMachineJson<MainCheck[]>(
    runGh([
      "run",
      "list",
      "--workflow",
      workflowDatabaseId.toString(),
      "--branch",
      branch,
      "--limit",
      QUEUE_CHECK_RUN_LIST_LIMIT.toString(),
      "--json",
      CHECK_RUN_FIELDS,
    ]),
  ).find((check) => checkIsVerdict(check));
// The newest verdict on a red check's workflow from what is still queued: the queue's, which is rewritten onto the tree
// Each window leaves and so reads every commit a later window carries to `main` — or, where the queue has none,
// `develop`'s, the windows in flight. Whether it read `main`'s red head at all is `settleTransitGap`'s question
export const readQueueCheck = ({ workflowDatabaseId }: MainCheck): MainCheck | undefined =>
  readBranchCheck(workflowDatabaseId, QUEUE_BRANCH) ?? readBranchCheck(workflowDatabaseId, DEVELOP_BRANCH);
