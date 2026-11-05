import type { ComputeQueueReading } from "#src/models/fleet/ComputeQueueReading";

import { COMPUTE_QUEUE_HEADING, COMPUTE_QUEUE_WAITING_HEADING } from "#src/services/fleet/constants";
import { parseComputeBlocker } from "#src/services/fleet/parseComputeBlocker";
import { parseOpenLines } from "#src/services/fleet/parseOpenLines";
import { readMarkdownSection } from "#src/services/fleet/readMarkdownSection";

// Every open item of one compute page: those under its queue heading are runnable, those under its waiting heading wait
// On an input, each carrying the blocker its line names. An open line with no id is skipped and counted, in either list,
// So a missing id is visible rather than lost
export const parseComputeQueue = (page: string): ComputeQueueReading => {
  const runnableItems = parseOpenLines(readMarkdownSection(page, COMPUTE_QUEUE_HEADING));
  const waitingItems = parseOpenLines(readMarkdownSection(page, COMPUTE_QUEUE_WAITING_HEADING));
  return {
    entries: runnableItems.filter((entry) => entry !== undefined),
    skipped: [...runnableItems, ...waitingItems].filter((entry) => entry === undefined).length,
    waiting: waitingItems
      .filter((entry) => entry !== undefined)
      .map((entry) => ({ ...entry, waiting: parseComputeBlocker(entry.line) })),
  };
};
