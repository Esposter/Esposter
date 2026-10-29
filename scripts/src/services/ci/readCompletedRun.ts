import type { CiJob } from "#src/models/ci/CiJob";

import { RUN_WATCH_INTERVAL_SECONDS } from "#src/services/ci/constants";
import { runToolAsync } from "#src/services/resume/runToolAsync";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

// Waits for the run until it completes, `--exit-status` left off so the watch ends whatever the conclusion, then reads it
export const readCompletedRun = async (runId: string): Promise<{ conclusion: string; jobs: CiJob[] }> => {
  await runToolAsync("gh", ["run", "watch", runId, "--interval", String(RUN_WATCH_INTERVAL_SECONDS)]);
  return parseMachineJson<{ conclusion: string; jobs: CiJob[] }>(
    await runToolAsync("gh", ["run", "view", runId, "--json", "conclusion,jobs"]),
  );
};
