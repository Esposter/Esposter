import type { CpuTotals } from "#src/models/machine/CpuTotals";
import type { CpuInfo } from "node:os";

// Sums every core's times, idle counted apart so a reading's busy share is the rest of its total
export const getCpuTotals = (cpus: CpuInfo[]): CpuTotals =>
  cpus.reduce<CpuTotals>(
    (totals, { times }) => {
      const { idle, irq, nice, sys, user } = times;
      const total = user + nice + sys + idle + irq;
      return { busy: totals.busy + total - idle, total: totals.total + total };
    },
    { busy: 0, total: 0 },
  );
