import type { FleetEntryReading } from "#src/models/fleet/FleetEntryReading";

import { COMPUTE_QUEUE_HEADING, COMPUTE_QUEUE_WAITING_HEADING } from "#src/services/fleet/constants";
import { parseOpenLines } from "#src/services/fleet/parseOpenLines";

// A section runs to the next level-two heading, which ends it
const SECTION_END_REGEX = /^## /mu;

// Every open item of one compute page: those under its queue heading are runnable, those under its waiting heading wait
// On an input. An open line with no id is skipped and counted, in either list, so a missing id is visible rather than lost
export const parseComputeQueue = (page: string): FleetEntryReading => {
  const afterQueue = page.split(COMPUTE_QUEUE_HEADING)[1] ?? "";
  const runnable = (afterQueue.split(COMPUTE_QUEUE_WAITING_HEADING)[0] ?? "").split(SECTION_END_REGEX)[0] ?? "";
  const waiting = (afterQueue.split(COMPUTE_QUEUE_WAITING_HEADING)[1] ?? "").split(SECTION_END_REGEX)[0] ?? "";
  const runnableItems = parseOpenLines(runnable);
  const waitingItems = parseOpenLines(waiting);
  return {
    entries: runnableItems.filter((entry) => entry !== undefined),
    skipped: [...runnableItems, ...waitingItems].filter((entry) => entry === undefined).length,
  };
};
