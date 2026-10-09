// The machine's CPU time summed over every core, in milliseconds, so two readings give the share busy between them
export interface CpuTotals {
  busy: number;
  total: number;
}
