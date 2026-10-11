// The machine watcher's latest reading as the pulse script prints it: when it was taken, and the CPU and GPU figures the
// Idle check reads. The GPU figure is absent where the machine has no reader for it
export interface MachinePulse {
  at: string;
  cpuPercentage: number;
  gpuPercentage?: number;
}
