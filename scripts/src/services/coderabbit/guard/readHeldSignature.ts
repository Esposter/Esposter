import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";
import type { CollectorJobView } from "#src/models/coderabbit/guard/CollectorJobView";

import { CI_FAILURE_CONCLUSION } from "#src/services/coderabbit/collect/constants";
import {
  CI_SUCCESS_CONCLUSION,
  COLLECT_JOB_NAME,
  COLLECTOR_WORKFLOW_FILE,
  GUARD_RED_STREAK,
  GUARD_RUN_LIST_LIMIT,
  RUN_SKIPPED_CONCLUSION,
} from "#src/services/coderabbit/guard/constants";
import { getRunFailureSignature } from "#src/services/coderabbit/guard/getRunFailureSignature";
import { readJobAnnotations } from "#src/services/coderabbit/guard/readJobAnnotations";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The red the newest collector runs keep failing on, when the last `GUARD_RED_STREAK` of them failed alike — the same
// Step, the same error line — which no rerun answers. Newest first: a run whose collect job succeeded ends the streak,
// And a run the filter skipped or one cancelled before it ran ended neither way and is read past. The run the guard
// Belongs to is still going, but its collect job has ended, so it is the newest read
export const readHeldSignature = (): FailureSignature | undefined => {
  const runIds = parseMachineJson<{ conclusion: string; databaseId: number }[]>(
    runGh([
      "run",
      "list",
      "--workflow",
      COLLECTOR_WORKFLOW_FILE,
      "--limit",
      GUARD_RUN_LIST_LIMIT.toString(),
      "--json",
      "conclusion,databaseId",
    ]),
  )
    .filter(({ conclusion }) => conclusion !== RUN_SKIPPED_CONCLUSION)
    .map(({ databaseId }) => databaseId);
  const signatures: FailureSignature[] = [];
  for (const runId of runIds) {
    const job = parseMachineJson<{ jobs: CollectorJobView[] }>(
      runGh(["run", "view", runId.toString(), "--json", "jobs"]),
    ).jobs.find(({ name }) => name === COLLECT_JOB_NAME);
    if (job?.conclusion === CI_SUCCESS_CONCLUSION) return undefined;
    else if (job?.conclusion !== CI_FAILURE_CONCLUSION) continue;

    const signature = getRunFailureSignature(job, readJobAnnotations(job.databaseId));
    if (signatures.some(({ hash }) => hash !== signature.hash)) return undefined;
    signatures.push(signature);
    if (signatures.length === GUARD_RED_STREAK) return signature;
  }
  return undefined;
};
