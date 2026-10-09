// One reading of a machine's load: its CPU share busy over the window, its GPU 3D share when a reader measured it, and
// Its free memory in gigabytes
export interface MachineSample {
  cpuPercentage: number;
  freeGigabytes: number;
  gpuPercentage?: number;
}
