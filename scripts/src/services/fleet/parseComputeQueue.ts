import type { FleetEntryReading } from "#src/models/fleet/FleetEntryReading";

import { COMPUTE_QUEUE_HEADING } from "#src/services/fleet/constants";
import { parseComputeQueueItem } from "#src/services/fleet/parseComputeQueueItem";

// The section a heading opens runs to the next level-two heading, which ends the compute queue
const SECTION_END_REGEX = /^## /mu;
// The waiting heading splits the queue: the items above it are runnable, the ones below wait on an input
const WAITING_REGEX = /^### Waiting/mu;
const OPEN_LINE_PREFIX = "- [ ] ";

// Every open line of a section, parsed: an item, or undefined for an open line with no id
const parseOpenLines = (text: string) =>
  text
    .split("\n")
    .filter((line) => line.startsWith(OPEN_LINE_PREFIX))
    .map((line) => parseComputeQueueItem(line));

// Every open item of the roadmap's compute queue above its waiting heading, in the order the roadmap lists them. An open
// Line with no id is skipped and counted, in the queue or its waiting list, so a missing id is visible rather than lost
export const parseComputeQueue = (roadmap: string): FleetEntryReading => {
  const afterHeading = roadmap.split(COMPUTE_QUEUE_HEADING)[1] ?? "";
  const section = afterHeading.split(SECTION_END_REGEX)[0] ?? "";
  const [runnable = "", waiting = ""] = section.split(WAITING_REGEX);
  const runnableItems = parseOpenLines(runnable);
  const waitingItems = parseOpenLines(waiting);
  return {
    entries: runnableItems.filter((entry) => entry !== undefined),
    skipped: [...runnableItems, ...waitingItems].filter((entry) => entry === undefined).length,
  };
};
