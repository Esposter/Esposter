import type { FleetEntryReading } from "#src/models/fleet/FleetEntryReading";

import { COMPUTE_QUEUE_DIRECTORY } from "#src/services/fleet/constants";
import { readComputeQueue } from "#src/services/fleet/readComputeQueue";
import { readProposalEntries } from "#src/services/fleet/readProposalEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { resolve } from "node:path";

// Everything the fleet may take, in the order it is offered: the compute queue's items, then the open proposal units,
// With the queue lines skipped for having no id
export const readFleetEntries = (): FleetEntryReading => {
  const queue = readComputeQueue(resolve(REPOSITORY_ROOT, COMPUTE_QUEUE_DIRECTORY));
  return { entries: [...queue.entries, ...readProposalEntries()], skipped: queue.skipped };
};
