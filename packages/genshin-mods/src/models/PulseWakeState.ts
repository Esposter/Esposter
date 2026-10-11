// What the wake decision reads of the machine: its figures, and how many readings in a row it has been idle
export interface PulseWakeState {
  cpuPercentage: number;
  gpuPercentage?: number;
  idleMinutes: number;
}
