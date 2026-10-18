import type { FleetEntryReading } from "#src/models/fleet/FleetEntryReading";
import type { QueueFile } from "#src/models/fleet/QueueFile";

import { COMPUTE_QUEUE_PAGE_FILE } from "#src/services/fleet/constants";
import { parseComputeQueue } from "#src/services/fleet/parseComputeQueue";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { basename } from "node:path";

// Every open item of every area's design in the compute folder, the index and the specs aside, designs in path order.
// An id two designs share is an error, since a claim is keyed by its id and two items under one would take each other's
// Claim
export const readComputeQueue = (files: readonly QueueFile[]): FleetEntryReading => {
  const readings = files
    .filter(({ path }) => basename(path) === COMPUTE_QUEUE_PAGE_FILE)
    .toSorted((firstFile, secondFile) => firstFile.path.localeCompare(secondFile.path))
    .map(({ text }) => parseComputeQueue(text));
  const entries = readings.flatMap(({ entries: pageEntries }) => pageEntries);
  const ids = entries.map(({ id }) => id);
  const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index);
  if (duplicateId !== undefined)
    throw new InvalidOperationError(Operation.Read, duplicateId, "more than one compute design holds this id");
  return { entries, skipped: readings.reduce((total, { skipped }) => total + skipped, 0) };
};
