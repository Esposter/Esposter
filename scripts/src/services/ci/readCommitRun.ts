import type { CiRun } from "#src/models/ci/CiRun";

import { CI_RUN_FIELDS, CI_WORKFLOW_FILE, RUN_CREATION_ATTEMPTS, RUN_CREATION_WAIT } from "#src/services/ci/constants";
import { runToolAsync } from "#src/services/resume/runToolAsync";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { setTimeout as sleep } from "node:timers/promises";

// Found by its commit, never by `--branch` with `--workflow`: GitHub's per-workflow branch filter answers with weeks-old
// Runs for `ai/queue` (the `running-checks` skill, "Watching the push's run")
export const readCommitRun = async (sha: string): Promise<CiRun | undefined> => {
  for (let attempt = 0; attempt < RUN_CREATION_ATTEMPTS; attempt++) {
    const [run] = parseMachineJson<CiRun[]>(
      // oxlint-disable-next-line no-await-in-loop -- each read waits for the one before it to find no run yet
      await runToolAsync("gh", [
        "run",
        "list",
        "--commit",
        sha,
        "--workflow",
        CI_WORKFLOW_FILE,
        "--limit",
        "1",
        "--json",
        CI_RUN_FIELDS,
      ]),
    );
    if (run) return run;
    // oxlint-disable-next-line no-await-in-loop -- the run is created after the push, with no event to wait on
    await sleep(RUN_CREATION_WAIT.total("milliseconds"));
  }
  return undefined;
};
