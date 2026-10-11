import type { HarbourState } from "#src/models/coderabbit/state/HarbourState";
import type { CollectorRun } from "#src/models/resume/CollectorRun";
import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { FAILED_RUN_CONCLUSIONS, RED_PATH_ACTION } from "#src/services/resume/constants";

const COMPLETED_STATUS = "completed";

const getRunItems = (run: CollectorRun | undefined): ResumeItem[] => {
  if (run === undefined) return [];
  if (run.status === COMPLETED_STATUS)
    return FAILED_RUN_CONCLUSIONS.includes(run.conclusion)
      ? [{ action: RED_PATH_ACTION, text: `latest run ${run.conclusion}` }]
      : [];
  return [{ action: "", text: `latest run ${run.status}` }];
};

// What the collector owes or holds, the release gate, and the latest run. An owed count is information, while a held
// Commit and a failed run are the session's to take down the red path
export const getCollectorItems = (
  { gate, heldShas, owedShas }: Pick<HarbourState, "gate" | "heldShas" | "owedShas">,
  run: CollectorRun | undefined,
): ResumeItem[] => [
  ...(owedShas.length > 0 ? [{ action: "", text: `${owedShas.length} commits owed to develop` }] : []),
  ...(heldShas.length > 0 ? [{ action: RED_PATH_ACTION, text: `${heldShas.length} held commits` }] : []),
  ...(gate ? [{ action: "", text: `release gate ${gate.kind}: ${gate.reason}` }] : []),
  ...getRunItems(run),
];
