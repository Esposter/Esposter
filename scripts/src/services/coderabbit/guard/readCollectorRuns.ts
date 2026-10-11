import type { CollectorRunView } from "#src/models/coderabbit/guard/CollectorRunView";

import { COLLECTOR_WORKFLOW_FILE, GUARD_RUN_LIST_LIMIT } from "#src/services/coderabbit/guard/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The newest collector runs at one status — a state, such as `in_progress`, or a conclusion, such as `success` — and,
// Given an instant, only those created since it. The API filters them before the bound, so the runs the caller's filter
// Skipped, most of every run, never take the places the runs that ran the cycle need
export const readCollectorRuns = (status: string, createdSince = ""): CollectorRunView[] =>
  parseMachineJson<CollectorRunView[]>(
    runGh([
      "run",
      "list",
      "--workflow",
      COLLECTOR_WORKFLOW_FILE,
      "--status",
      status,
      ...(createdSince ? ["--created", `>=${createdSince}`] : []),
      "--limit",
      GUARD_RUN_LIST_LIMIT.toString(),
      "--json",
      "createdAt,databaseId",
    ]),
  );
