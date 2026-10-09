import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";
import type { RunJobsView } from "#src/models/coderabbit/collect/RunJobsView";

import { CI_FAILURE_CONCLUSION } from "#src/services/coderabbit/collect/constants";
import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// What a red run failed on, read off the run itself: the jobs CI skipped behind a failed one are no part of it, since
// They name no red of their own
export const readFailureSignature = (runId: number): FailureSignature => {
  const { jobs, workflowName } = parseMachineJson<RunJobsView>(
    runGh(["run", "view", runId.toString(), "--json", "workflowName,jobs"]),
  );
  return getFailureSignature(
    workflowName,
    jobs.filter(({ conclusion }) => conclusion === CI_FAILURE_CONCLUSION).map(({ name }) => name),
  );
};
