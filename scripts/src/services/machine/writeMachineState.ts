import type { MachineStateFile } from "#src/models/machine/MachineStateFile";

import { MACHINE_STATE_NEXT_PATH, MACHINE_STATE_PATH } from "#src/services/machine/constants";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { renameSync } from "node:fs";

// Written beside the file and renamed over it, so a reader never sees half a reading
export const writeMachineState = (state: MachineStateFile): void => {
  writeJsonFile(MACHINE_STATE_NEXT_PATH, state);
  renameSync(MACHINE_STATE_NEXT_PATH, MACHINE_STATE_PATH);
};
