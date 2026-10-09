import type { CpuTotals } from "#src/models/machine/CpuTotals";

// The share of CPU time busy between two readings, as a percentage of the time that passed across every core
export const getCpuPercentage = (previous: CpuTotals, current: CpuTotals): number =>
  (100 * (current.busy - previous.busy)) / (current.total - previous.total);
