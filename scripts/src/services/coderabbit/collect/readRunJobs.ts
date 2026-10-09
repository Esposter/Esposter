import type { RunJobsView } from "#src/models/coderabbit/collect/RunJobsView";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// A run's workflow and the verdict of each job it ran, read off the run itself
export const readRunJobs = (runId: number): RunJobsView =>
  parseMachineJson<RunJobsView>(runGh(["run", "view", runId.toString(), "--json", "workflowName,jobs"]));
