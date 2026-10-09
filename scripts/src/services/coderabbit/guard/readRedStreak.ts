import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";
import type { CollectorJobView } from "#src/models/coderabbit/guard/CollectorJobView";
import type { CollectorRunView } from "#src/models/coderabbit/guard/CollectorRunView";
import type { RedStreak } from "#src/models/coderabbit/guard/RedStreak";

import { CI_FAILURE_CONCLUSION, CI_SUCCESS_CONCLUSION } from "#src/services/coderabbit/collect/constants";
import { COLLECT_JOB_NAME, GUARD_RED_STREAK } from "#src/services/coderabbit/guard/constants";
import { getRunFailureSignature } from "#src/services/coderabbit/guard/getRunFailureSignature";
import { readJobAnnotations } from "#src/services/coderabbit/guard/readJobAnnotations";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The red the given runs end on, newest first: the last `GUARD_RED_STREAK` collect jobs failed alike — the same step,
// The same error line — which no rerun answers. A collect job that succeeded ends the streak, and one that neither
// Succeeded nor failed ran nothing and is read past. A run two lists both carry, one that ended between their reads, is
// Read once
export const readRedStreak = (runs: CollectorRunView[]): RedStreak | undefined => {
  const newestFirstRuns = [...new Map(runs.map((run) => [run.databaseId, run])).values()].toSorted(
    (firstRun, secondRun) =>
      Temporal.Instant.compare(Temporal.Instant.from(secondRun.createdAt), Temporal.Instant.from(firstRun.createdAt)),
  );
  const signatures: FailureSignature[] = [];
  for (const { createdAt, databaseId } of newestFirstRuns) {
    const job = parseMachineJson<{ jobs: CollectorJobView[] }>(
      runGh(["run", "view", databaseId.toString(), "--json", "jobs"]),
    ).jobs.find(({ name }) => name === COLLECT_JOB_NAME);
    if (job?.conclusion === CI_SUCCESS_CONCLUSION) return undefined;
    else if (job?.conclusion !== CI_FAILURE_CONCLUSION) continue;

    const signature = getRunFailureSignature(job, readJobAnnotations(job.databaseId));
    if (signatures.some(({ hash }) => hash !== signature.hash)) return undefined;
    signatures.push(signature);
    if (signatures.length === GUARD_RED_STREAK) return { createdAt, signature };
  }
  return undefined;
};
