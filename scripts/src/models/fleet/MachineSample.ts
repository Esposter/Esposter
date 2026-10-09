// One reading of a machine's load: its CPU share busy over the window, and its GPU 3D share and its free memory in
// Gigabytes when a reader measured them
export interface MachineSample {
  cpuPercentage: number;
  freeGigabytes?: number;
  gpuPercentage?: number;
}
