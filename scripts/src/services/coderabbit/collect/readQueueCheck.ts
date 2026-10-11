import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";
import type { QueueCheck } from "#src/models/coderabbit/collect/QueueCheck";

import {
  CI_FAILURE_CONCLUSION,
  CI_SUCCESS_CONCLUSION,
  QUEUE_BRANCH,
  QUEUE_CHECK_RUN_LIST_LIMIT,
} from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The newest run of a red check's workflow on the queue that reached a verdict, green or red — a run cancelled while it
// Waited behind another ran no job. The queue is rewritten onto the tree each window leaves, so its run reads every
// Commit a later window carries to `main`. The branch is matched here, among the workflow's newest runs, rather than
// By GitHub's per-workflow branch filter, which has gone stale on this repository (`readRedMainCheck`): a stale filter
// Hands back an old verdict as the newest, where a list that holds no queue run hands back none
export const readQueueCheck = ({ workflowDatabaseId }: MainCheck): QueueCheck | undefined =>
  parseMachineJson<QueueCheck[]>(
    runGh([
      "run",
      "list",
      "--workflow",
      workflowDatabaseId.toString(),
      "--limit",
      QUEUE_CHECK_RUN_LIST_LIMIT.toString(),
      "--json",
      "conclusion,databaseId,headBranch,headSha,status,url,workflowDatabaseId",
    ]),
  ).find(
    ({ conclusion, headBranch }) =>
      headBranch === QUEUE_BRANCH && (conclusion === CI_SUCCESS_CONCLUSION || conclusion === CI_FAILURE_CONCLUSION),
  );
