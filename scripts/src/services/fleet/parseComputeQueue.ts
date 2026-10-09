import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { COMPUTE_QUEUE_HEADING } from "#src/services/fleet/constants";
import { parseComputeQueueItem } from "#src/services/fleet/parseComputeQueueItem";

// The section a heading opens runs to the next level-two heading, or to the waiting heading, which is not owed yet
const SECTION_END_REGEX = /^(?:## |### Waiting)/mu;

// Every open item of the roadmap's compute queue, in the order the roadmap lists them
export const parseComputeQueue = (roadmap: string): FleetEntry[] => {
  const afterHeading = roadmap.split(COMPUTE_QUEUE_HEADING)[1] ?? "";
  const section = afterHeading.split(SECTION_END_REGEX)[0] ?? "";
  return section
    .split("\n")
    .filter((line) => line.startsWith("- [ ] "))
    .map((line) => parseComputeQueueItem(line))
    .filter((entry) => entry !== undefined);
};
