import type { MachineProcess } from "#src/models/machine/MachineProcess";

import { parsePsProcesses } from "#src/services/machine/parsePsProcesses";
import { readWindowsProcesses } from "#src/services/machine/readWindowsProcesses";
import { runMachineCommand } from "#src/services/machine/runMachineCommand";
import { getResultAsync } from "@esposter/shared";

// Every process with its parent, CPU time and command line, or none where no reader exists or the listing failed
export const readProcesses = async (): Promise<MachineProcess[]> => {
  switch (process.platform) {
    case "darwin":
      return (await getResultAsync(() => runMachineCommand("ps", ["-axo", "pid=,ppid=,time=,args="]))).match(
        parsePsProcesses,
        (error) => {
          console.error(error);
          return [];
        },
      );
    case "win32":
      return readWindowsProcesses();
    default:
      return [];
  }
};
