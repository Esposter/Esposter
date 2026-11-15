import type { CutoverCheckpoint } from "#src/models/cutover/CutoverCheckpoint";

import { DELTA_CLOCK_MARGIN_MS } from "#src/services/cutover/objects/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The instant a delta copies changes from is the pre-copy's start less the clock margin
// A delta needs the full copy to have finished first, so a unit missing either throws rather than copying from an instant it lacks
export const getChangedSince = (checkpoint: CutoverCheckpoint, unit: string): string => {
  if (!checkpoint.preCopyStartedAt)
    throw new InvalidOperationError(
      Operation.Read,
      unit,
      "has no pre-copy to take changes from: copy-tables must run first",
    );
  if (!checkpoint.completedAt)
    throw new InvalidOperationError(Operation.Read, unit, "has an unfinished full copy: copy-tables must finish first");
  return new Date(Date.parse(checkpoint.preCopyStartedAt) - DELTA_CLOCK_MARGIN_MS).toISOString();
};
