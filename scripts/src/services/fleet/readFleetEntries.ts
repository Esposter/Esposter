import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { ROADMAP_PATH } from "#src/services/fleet/constants";
import { parseComputeQueue } from "#src/services/fleet/parseComputeQueue";
import { readProposalEntries } from "#src/services/fleet/readProposalEntries";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Everything the fleet may take, in the order it is offered: the compute queue's items, then the open proposal units
export const readFleetEntries = (): FleetEntry[] => [
  ...parseComputeQueue(readFileSync(resolve(REPOSITORY_ROOT, ROADMAP_PATH), "utf8")),
  ...readProposalEntries(),
];
