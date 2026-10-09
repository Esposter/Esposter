import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";

import { CI_FAILURE_CONCLUSION } from "#src/services/coderabbit/collect/constants";
import {
  CI_SUCCESS_CONCLUSION,
  GUARD_RUN_LIST_LIMIT,
  RUN_CANCELLED_CONCLUSION,
  RUN_IN_PROGRESS_STATUS,
} from "#src/services/coderabbit/guard/constants";
import { readCollectorRuns } from "#src/services/coderabbit/guard/readCollectorRuns";
import { readRedStreak } from "#src/services/coderabbit/guard/readRedStreak";

// The red the newest collector runs keep failing on, when the last `GUARD_RED_STREAK` of them failed alike
// (`readRedStreak`). Only the runs whose collect job can have ended are listed, each status by the API's own filter, so
// The runs the caller's filter skipped and the fires superseded while pending — nearly every run — never crowd the
// Streak out of reach: the runs still going, the one the guard belongs to among them, and the green and the red ones.
// A cancelled run is a fire superseded while pending, save one whose retrigger or guard a newer run replaced after its
// Collect job ended, so the cancelled runs are read only across the streak's own span, before it holds — and a span
// Holding more of them than one list reads leaves some unread, so it holds nothing
export const readHeldSignature = (): FailureSignature | undefined => {
  const runs = [RUN_IN_PROGRESS_STATUS, CI_SUCCESS_CONCLUSION, CI_FAILURE_CONCLUSION].flatMap((status) =>
    readCollectorRuns(status),
  );
  const streak = readRedStreak(runs);
  if (streak === undefined) return undefined;
  const cancelledRuns = readCollectorRuns(RUN_CANCELLED_CONCLUSION, streak.createdAt);
  if (cancelledRuns.length === GUARD_RUN_LIST_LIMIT) return undefined;
  return readRedStreak([...runs, ...cancelledRuns])?.signature;
};
