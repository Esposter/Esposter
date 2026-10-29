import type { ClaimHolder } from "#src/models/fleet/ClaimHolder";

import { claimFleetEntry } from "#src/services/fleet/claimFleetEntry";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { readRequiredMachineProfile } from "#src/services/fleet/readRequiredMachineProfile";
import { readMachineSample } from "#src/services/fleet/readMachineSample";
import { requireFleetWorker } from "#src/services/fleet/requireFleetWorker";

// Takes `entry` for the worker given on this machine, its load sampled as the claim records it, and returns the holder it
// Claimed as with the outcome of `claimFleetEntry`
export const claimFleetEntryHere = async (
  entry: string,
  worker: string,
): Promise<ReturnType<typeof claimFleetEntry> & { holder: ClaimHolder }> => {
  const profile = readRequiredMachineProfile();
  const holder: ClaimHolder = { machine: profile.id, worker: requireFleetWorker(worker) };
  const sample = await readMachineSample();
  const load = formatMachineLoad(sample.cpuPercentage, sample.gpuPercentage, sample.freeGigabytes, process.platform);
  return { holder, ...claimFleetEntry(entry, holder, load) };
};
