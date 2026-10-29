import type { SetupStatus } from "#src/models/setup/SetupStatus";

// One line of the setup table: the step, what it found or did, and the command or link that closes it, if any
export interface SetupRow {
  next: string;
  status: SetupStatus;
  step: string;
}
