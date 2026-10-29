import type { FleetEntry } from "#src/models/fleet/FleetEntry";

import { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import { claimFleetEntry } from "#src/services/fleet/claimFleetEntry";
import { filterFleetEntries } from "#src/services/fleet/filterFleetEntries";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { readFleetEntries } from "#src/services/fleet/readFleetEntries";
import { readRequiredMachineProfile } from "#src/services/fleet/readRequiredMachineProfile";
import { readMachineSample } from "#src/services/fleet/readMachineSample";
import { selectTakeableEntries } from "#src/services/fleet/selectTakeableEntries";

// Claims the first entry this machine may take among those `lane` and `kind` filter to, for `worker`, and returns it, or
// Undefined when none is takeable. A queue line with no id is warned about on stderr, so a missing id is never silent
export const claimNextFleetEntry = async (
  lane: string,
  kind: string,
  worker: string,
): Promise<FleetEntry | undefined> => {
  const profile = readRequiredMachineProfile();
  const sample = await readMachineSample();
  const load = formatMachineLoad(sample.cpuPercentage, sample.gpuPercentage, sample.freeGigabytes, process.platform);
  const { entries, skipped } = readFleetEntries();
  if (skipped > 0)
    console.warn(`skipped ${skipped} compute-queue line(s) with no {id}, so they cannot be taken until they have one`);
  const candidates = selectTakeableEntries(
    filterFleetEntries(entries, lane, kind),
    profile,
    readClaimedRefs(),
    Temporal.Now.instant().epochMilliseconds,
  );
  for (const entry of candidates)
    if (claimFleetEntry(entry.id, { machine: profile.id, worker }, load).attempt === ClaimAttempt.Won) return entry;
  return undefined;
};
