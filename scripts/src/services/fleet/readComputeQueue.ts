import type { FleetEntryReading } from "#src/models/fleet/FleetEntryReading";
import type { QueueFile } from "#src/models/fleet/QueueFile";

import { readComputeAreas } from "#src/services/fleet/readComputeAreas";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every open runnable item of every area's design in the compute folder, each taking the phase its area holds, with the
// Lines skipped for having no id. An id two designs share is an error, since a claim is keyed by its id and two items under
// One would take each other's claim
export const readComputeQueue = (files: readonly QueueFile[]): FleetEntryReading => {
  const areas = readComputeAreas(files);
  const entries = areas.flatMap(({ queue }) => queue);
  const ids = entries.map(({ id }) => id);
  const duplicateId = ids.find((id, index) => ids.indexOf(id) !== index);
  if (duplicateId !== undefined)
    throw new InvalidOperationError(Operation.Read, duplicateId, "more than one compute design holds this id");
  return { entries, skipped: areas.reduce((total, { skipped }) => total + skipped, 0) };
};
