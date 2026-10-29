import type { SetupRow } from "#src/models/setup/SetupRow";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { getStepRow } from "#src/services/setup/getStepRow";

// A step that is done once its command exits 0, and otherwise needs the person to run the command `next` names
export const getRunRow = (step: string, status: number | null, next: string): SetupRow =>
  status === 0 ? { next: "", status: SetupStatus.Done, step } : getStepRow(step, false, next);
