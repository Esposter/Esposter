import { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import { claimFleetEntry } from "#src/services/fleet/claimFleetEntry";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { readRequiredMachineProfile } from "#src/services/fleet/readMachineProfile";
import { readMachineSample } from "#src/services/fleet/readMachineSample";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:claim <id>` — takes an entry for this machine as a claim ref on origin. Exit 0 when won, exit 1 naming
// The holder when another machine's live claim keeps it (the throughput skill, `references/fleet.md`)
await runMain(
  defineCommand({
    args: { id: { description: "The entry's id", required: true, type: "positional" } },
    meta: {
      description: "Claim an entry for this machine on origin, or name the machine that holds it",
      name: "claim",
    },
    run: async ({ args }) => {
      const profile = readRequiredMachineProfile();
      const sample = await readMachineSample();
      const load = formatMachineLoad(sample.cpuPercentage, sample.gpuPercentage, sample.freeGigabytes);
      const { attempt, claimed } = claimFleetEntry(args.id, profile.id, load);
      if (attempt === ClaimAttempt.Won) {
        console.info(`claimed ${args.id}`);
        return;
      }
      console.info(`${args.id} is held by ${claimed.message.machine} since ${claimed.message.claimedAt}`);
      process.exitCode = 1;
    },
  }),
);
