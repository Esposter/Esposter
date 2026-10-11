import type { FleetEntryReading } from "#src/models/fleet/FleetEntryReading";
import type { QueueFile } from "#src/models/fleet/QueueFile";

import { COMPUTE_QUEUE_INDEX_FILE } from "#src/services/fleet/constants";
import { parseComputeQueue } from "#src/services/fleet/parseComputeQueue";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { basename } from "node:path";

const MARKDOWN_EXTENSION = ".md";

// Every open item of every area page in the compute folder, the index excepted, pages in path order. An id two pages
// Share is an error, since a claim is keyed by its id and two items under one would take each other's claim
export const readComputeQueue = (files: readonly QueueFile[]): FleetEntryReading => {
  const readings = files
    .filter(({ path }) => basename(path) !== COMPUTE_QUEUE_INDEX_FILE && path.endsWith(MARKDOWN_EXTENSION))
    .toSorted((firstFile, secondFile) => firstFile.path.localeCompare(secondFile.path))
    .map(({ text }) => parseComputeQueue(text));
  const entries = readings.flatMap(({ entries: pageEntries }) => pageEntries);
  const ids = entries.map(({ id }) => id);
  const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index);
  if (duplicateId !== undefined)
    throw new InvalidOperationError(Operation.Read, duplicateId, "more than one compute page holds this id");
  return { entries, skipped: readings.reduce((total, { skipped }) => total + skipped, 0) };
};
