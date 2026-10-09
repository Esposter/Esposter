import type { MachineProcess } from "#src/models/machine/MachineProcess";

// A Windows process as the listing reads it, with the executable it runs, which says whether it is an MSYS process
export interface WindowsProcess extends MachineProcess {
  executablePath: string;
}
