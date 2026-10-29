import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";

// A step that is either in place, with nothing to print, or needs the person to run the command that closes it
export const getStepRow = (step: string, isInPlace: boolean, next: string): SetupRow =>
  isInPlace ? { next: "", status: SetupStatus.Ok, step } : { next, status: SetupStatus.NeedsYou, step };
