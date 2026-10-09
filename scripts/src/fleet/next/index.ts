import { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import { claimFleetEntry } from "#src/services/fleet/claimFleetEntry";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { readClaimedRefs } from "#src/services/fleet/readClaimedRefs";
import { readFleetEntries } from "#src/services/fleet/readFleetEntries";
import { readRequiredMachineProfile } from "#src/services/fleet/readMachineProfile";
import { readMachineSample } from "#src/services/fleet/readMachineSample";
import { selectTakeableEntries } from "#src/services/fleet/selectTakeableEntries";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:next` — claims the first entry this machine may take and prints its id. Prints nothing when none is
// Takeable, which leaves the machine idle (the throughput skill, `references/fleet.md`)
await runMain(
  defineCommand({
    meta: {
      description: "Claim the first entry this machine may take and print its id, or print nothing",
      name: "next",
    },
    run: async () => {
      const profile = readRequiredMachineProfile();
      const sample = await readMachineSample();
      const load = formatMachineLoad(sample.cpuPercentage, sample.gpuPercentage, sample.freeGigabytes);
      const candidates = selectTakeableEntries(
        readFleetEntries(),
        profile,
        readClaimedRefs(),
        Temporal.Now.instant().epochMilliseconds,
      );
      for (const { id } of candidates)
        // oxlint-disable-next-line no-await-in-loop -- a candidate is claimed only after the one before it was refused
        if (claimFleetEntry(id, profile.id, load).attempt === ClaimAttempt.Won) {
          console.info(id);
          return;
        }
    },
  }),
);
