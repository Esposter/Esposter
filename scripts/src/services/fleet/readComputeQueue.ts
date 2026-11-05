import type { FleetEntryReading } from "#src/models/fleet/FleetEntryReading";
import type { QueueFile } from "#src/models/fleet/QueueFile";

import { COMPUTE_QUEUE_INDEX_FILE, COMPUTE_QUEUE_PAGE_FILE } from "#src/services/fleet/constants";
import { parseComputePhases } from "#src/services/fleet/parseComputePhases";
import { parseComputeQueue } from "#src/services/fleet/parseComputeQueue";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { basename, dirname } from "node:path";

// Every open item of every area's design in the compute folder, the index and the specs aside, designs in path order.
// Each item takes the phase its design's folder holds in the index's Phases table, and a design with no row there fails
// the read. An id two designs share is an error, since a claim is keyed by its id and two items under one would take
// Each other's claim
export const readComputeQueue = (files: readonly QueueFile[]): FleetEntryReading => {
  const phases = parseComputePhases(files.find(({ path }) => basename(path) === COMPUTE_QUEUE_INDEX_FILE)?.text ?? "");
  const readings = files
    .filter(({ path }) => basename(path) === COMPUTE_QUEUE_PAGE_FILE)
    .toSorted((firstFile, secondFile) => firstFile.path.localeCompare(secondFile.path))
    .map(({ path, text }) => {
      const phase = phases.get(basename(dirname(path)));
      if (phase === undefined)
        throw new InvalidOperationError(
          Operation.Read,
          path,
          "its area has no row in the Phases table of the compute README",
        );
      const reading = parseComputeQueue(text);
      return { entries: reading.entries.map((entry) => ({ ...entry, phase })), skipped: reading.skipped };
    });
  const entries = readings.flatMap(({ entries: pageEntries }) => pageEntries);
  const ids = entries.map(({ id }) => id);
  const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index);
  if (duplicateId !== undefined)
    throw new InvalidOperationError(Operation.Read, duplicateId, "more than one compute design holds this id");
  return { entries, skipped: readings.reduce((total, { skipped }) => total + skipped, 0) };
};
