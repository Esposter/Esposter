import type { FleetEntryReading } from "#src/models/fleet/FleetEntryReading";

import { COMPUTE_QUEUE_INDEX_FILE } from "#src/services/fleet/constants";
import { parseComputeQueue } from "#src/services/fleet/parseComputeQueue";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MARKDOWN_EXTENSION = ".md";

// Every open item of every area page in the compute folder, the index excepted, pages in name order. An id two pages
// Share is an error, since a claim is keyed by its id and two items under one would take each other's claim
export const readComputeQueue = (directory: string): FleetEntryReading => {
  const pageNames = readdirSync(directory)
    .filter((name) => name !== COMPUTE_QUEUE_INDEX_FILE && name.endsWith(MARKDOWN_EXTENSION))
    .toSorted();
  const readings = pageNames.map((name) => parseComputeQueue(readFileSync(join(directory, name), "utf8")));
  const entries = readings.flatMap(({ entries: pageEntries }) => pageEntries);
  const ids = entries.map(({ id }) => id);
  const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index);
  if (duplicateId !== undefined)
    throw new InvalidOperationError(Operation.Read, duplicateId, "more than one compute page holds this id");
  return { entries, skipped: readings.reduce((total, { skipped }) => total + skipped, 0) };
};
