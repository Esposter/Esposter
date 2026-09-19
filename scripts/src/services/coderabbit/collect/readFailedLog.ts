import { getFailedLogExcerpt } from "#src/services/coderabbit/collect/getFailedLogExcerpt";
import { runGh } from "#src/services/shared/runGh";

// What a red run said, cut to what the repairer reads
export const readFailedLog = (runId: number): string =>
  getFailedLogExcerpt(runGh(["run", "view", runId.toString(), "--log-failed"]));
