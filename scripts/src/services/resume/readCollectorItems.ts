import type { CollectorRun } from "#src/models/resume/CollectorRun";
import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { readHarbourState } from "#src/services/coderabbit/state/readHarbourState";
import { COLLECTOR_WORKFLOW } from "#src/services/resume/constants";
import { getCollectorItems } from "#src/services/resume/getCollectorItems";
import { runToolAsync } from "#src/services/resume/runToolAsync";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// The run list starts before the harbour's own synchronous reads, so the two overlap
export const readCollectorItems = async (): Promise<ResumeItem[]> => {
  const runsOutput = runToolAsync("gh", [
    "run",
    "list",
    "--workflow",
    COLLECTOR_WORKFLOW,
    "--limit",
    "1",
    "--json",
    "status,conclusion",
  ]);
  const state = readHarbourState();
  return getCollectorItems(state, parseMachineJson<CollectorRun[]>(await runsOutput)[0]);
};
