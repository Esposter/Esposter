import type { MsysProcess } from "#src/models/machine/MsysProcess";

// A process as the orphan sweep reads it: its parent, its name without a path or `.exe`, and the CPU time it has burnt.
// On Windows an MSYS process also carries its MSYS identity, which judges it in place of the Win32 parent
export interface MachineProcess {
  commandLine: string;
  cpuSeconds: number;
  msys?: MsysProcess;
  name: string;
  parentProcessId: number;
  processId: number;
}
