import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";
import type { CollectorJobView } from "#src/models/coderabbit/guard/CollectorJobView";
import type { CollectorRunView } from "#src/models/coderabbit/guard/CollectorRunView";
import type { RedStreak } from "#src/models/coderabbit/guard/RedStreak";

import { CI_FAILURE_CONCLUSION, CI_SUCCESS_CONCLUSION } from "#src/services/coderabbit/collect/constants";
import {
  COLLECT_JOB_NAME,
  FAILURE_ANNOTATION_LEVEL,
  GUARD_RED_STREAK,
  GUARD_SETUP_RED_STREAK,
  SETUP_STEP_NAMES,
} from "#src/services/coderabbit/guard/constants";
import { getRunFailureSignature } from "#src/services/coderabbit/guard/getRunFailureSignature";
import { readJobAnnotations } from "#src/services/coderabbit/guard/readJobAnnotations";
import { GITHUB_OUTAGE_REGEX } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The red the given runs end on, newest first: the last `GUARD_RED_STREAK` collect jobs failed alike — the same step,
// The same error line — which no rerun answers. A red in a step that fetches the code or its toolchain
// (`SETUP_STEP_NAMES`) is GitHub's or the network's as often as a break's, so the setup's reds keep a streak of their
// Own, `GUARD_SETUP_RED_STREAK` long, which a red past the setup ends and the other streak reads past. A collect job
// That succeeded ends both, and one that neither succeeded nor failed ran nothing and is read past, as is a red any
// Failure line of which is GitHub's own answer — a server error or a rate limit (`GITHUB_OUTAGE_REGEX`) — since each
// Clears by itself. A run two lists both carry, one that ended between their reads, is read once
export const readRedStreak = (runs: CollectorRunView[]): RedStreak | undefined => {
  const newestFirstRuns = [...new Map(runs.map((run) => [run.databaseId, run])).values()].toSorted(
    (firstRun, secondRun) =>
      Temporal.Instant.compare(Temporal.Instant.from(secondRun.createdAt), Temporal.Instant.from(firstRun.createdAt)),
  );
  const signatures: FailureSignature[] = [];
  const setupSignatures: FailureSignature[] = [];
  let isSetupStreakEnded = false;
  for (const { createdAt, databaseId } of newestFirstRuns) {
    const job = parseMachineJson<{ jobs: CollectorJobView[] }>(
      runGh(["run", "view", databaseId.toString(), "--json", "jobs"]),
    ).jobs.find(({ name }) => name === COLLECT_JOB_NAME);
    if (job?.conclusion === CI_SUCCESS_CONCLUSION) return undefined;
    else if (job?.conclusion !== CI_FAILURE_CONCLUSION) continue;

    const isSetup = job.steps.some(
      ({ conclusion, name }) => conclusion === CI_FAILURE_CONCLUSION && SETUP_STEP_NAMES.has(name),
    );
    if (isSetup && isSetupStreakEnded) continue;
    // A red past the setup ends the setup's streak, GitHub's own included, since that run's setup passed
    else if (!isSetup) isSetupStreakEnded = true;

    const annotations = readJobAnnotations(job.databaseId);
    if (
      annotations.some(
        ({ annotation_level, message }) =>
          annotation_level === FAILURE_ANNOTATION_LEVEL && GITHUB_OUTAGE_REGEX.test(message),
      )
    )
      continue;

    const signature = getRunFailureSignature(job, annotations);
    const [streakSignatures, streakLength] = isSetup
      ? [setupSignatures, GUARD_SETUP_RED_STREAK]
      : [signatures, GUARD_RED_STREAK];
    // An unlike red ends its own streak — the other's ending the read, since the setup's has ended by then
    if (streakSignatures.some(({ hash }) => hash !== signature.hash)) {
      if (!isSetup) return undefined;
      isSetupStreakEnded = true;
      continue;
    }

    streakSignatures.push(signature);
    if (streakSignatures.length === streakLength) return { createdAt, isSetup, signature };
  }
  return undefined;
};
