import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { COMPUTE_QUEUE_DIRECTORY, FILL_RULES_LINE } from "#src/services/fleet/constants";
import { getUnitSpecPath } from "#src/services/fleet/getUnitSpecPath";

// The ready-to-send brief for one claim: the entry and its worker, the spec to read (a unit's page, or a queue item's
// Line quoted whole with the page it is edited on), the command that releases the claim, and the standing rules
export const getFillBrief = (entry: FleetEntry, worker: string): string => {
  const spec =
    entry.kind === FleetEntryKind.Unit
      ? `Spec: ${getUnitSpecPath(entry.id)}`
      : `Item line, on its area page under ${COMPUTE_QUEUE_DIRECTORY}/: ${entry.line}`;
  return [
    `Entry ${entry.id}, worker ${worker}.`,
    spec,
    `Release: pnpm ai:fleet:release ${entry.id} --worker ${worker}`,
    FILL_RULES_LINE,
  ].join("\n");
};
