import type { MachineProcess } from "#src/models/machine/MachineProcess";

import { ORPHAN_COMMAND_LINE_CHARACTERS } from "#src/services/machine/constants";
import { getResult } from "@esposter/shared";

// Stops each orphan the moment it is seen, since a search with no reader left only burns the CPU
export const sweepOrphans = (orphans: MachineProcess[]): void => {
  for (const { commandLine, name, processId } of orphans)
    getResult(() => process.kill(processId, "SIGKILL")).match(
      () => {
        console.info(`swept orphan ${name} ${processId}: ${commandLine.slice(0, ORPHAN_COMMAND_LINE_CHARACTERS)}`);
      },
      (error) => {
        console.error(error);
      },
    );
};
