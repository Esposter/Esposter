import type { CiRun } from "#src/models/ci/CiRun";

import { BRANCH_RUN_LIMIT, CI_RUN_FIELDS } from "#src/services/ci/constants";
import { runToolAsync } from "#src/services/resume/runToolAsync";
import { QUEUE_BRANCH } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";

export const readBranchRuns = async (): Promise<CiRun[]> =>
  parseMachineJson<CiRun[]>(
    await runToolAsync("gh", [
      "run",
      "list",
      "--branch",
      QUEUE_BRANCH,
      "--limit",
      String(BRANCH_RUN_LIMIT),
      "--json",
      CI_RUN_FIELDS,
    ]),
  );
