import type { FleetEntryReading } from "#src/models/fleet/FleetEntryReading";

import { COMPUTE_QUEUE_DIRECTORY } from "#src/services/fleet/constants";
import { readComputeQueue } from "#src/services/fleet/readComputeQueue";
import { readProposalEntries } from "#src/services/fleet/readProposalEntries";
import { readQueueFiles } from "#src/services/fleet/readQueueFiles";
import { PROPOSALS_DIRECTORY } from "#src/services/proposals/constants";
import { QUEUE_BRANCH } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";

// Everything the fleet may take, in the order it is offered: the compute queue's items, then the open proposal units,
// With the queue lines skipped for having no id. Both are read off the queue branch as origin holds it, fetched fresh
export const readFleetEntries = (): FleetEntryReading => {
  runGit(["fetch", "--quiet", "origin", QUEUE_BRANCH]);
  const queue = readComputeQueue(readQueueFiles(COMPUTE_QUEUE_DIRECTORY));
  return {
    entries: [...queue.entries, ...readProposalEntries(readQueueFiles(PROPOSALS_DIRECTORY))],
    skipped: queue.skipped,
  };
};
