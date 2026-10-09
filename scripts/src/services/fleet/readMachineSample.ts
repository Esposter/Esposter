import type { MachineSample } from "#src/models/fleet/MachineSample";

import { LOAD_SAMPLE_MILLISECONDS } from "#src/services/fleet/constants";
import { getCpuPercentage } from "#src/services/machine/getCpuPercentage";
import { getCpuTotals } from "#src/services/machine/getCpuTotals";
import { readAvailableGigabytes } from "#src/services/machine/readAvailableGigabytes";
import { readGpuPercentage } from "#src/services/machine/readGpuPercentage";
import { cpus } from "node:os";
import { setTimeout as sleep } from "node:timers/promises";

// The machine's load as the watcher reads it, sampled over one short window: the same CPU, GPU and memory readers the
// Watcher's minute samples use, so a claim's load line and a heartbeat read one machine the same way
export const readMachineSample = async (): Promise<MachineSample> => {
  const previousTotals = getCpuTotals(cpus());
  await sleep(LOAD_SAMPLE_MILLISECONDS);
  const cpuPercentage = getCpuPercentage(previousTotals, getCpuTotals(cpus()));
  const gpuPercentage = await readGpuPercentage();
  const freeGigabytes = await readAvailableGigabytes();
  return {
    cpuPercentage,
    ...(freeGigabytes === undefined ? {} : { freeGigabytes }),
    ...(gpuPercentage === undefined ? {} : { gpuPercentage }),
  };
};
