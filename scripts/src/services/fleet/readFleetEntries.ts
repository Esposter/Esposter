import type { FleetEntryReading } from "#src/models/fleet/FleetEntryReading";

import { ROADMAP_PATH } from "#src/services/fleet/constants";
import { parseComputeQueue } from "#src/services/fleet/parseComputeQueue";
import { readProposalEntries } from "#src/services/fleet/readProposalEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Everything the fleet may take, in the order it is offered: the compute queue's items, then the open proposal units,
// With the queue lines skipped for having no id
export const readFleetEntries = (): FleetEntryReading => {
  const queue = parseComputeQueue(readFileSync(resolve(REPOSITORY_ROOT, ROADMAP_PATH), "utf8"));
  return { entries: [...queue.entries, ...readProposalEntries()], skipped: queue.skipped };
};
