// A process as the orphan sweep reads it: its parent, its name without a path or `.exe`, and the CPU time it has burnt
export interface MachineProcess {
  commandLine: string;
  cpuSeconds: number;
  name: string;
  parentProcessId: number;
  processId: number;
}
