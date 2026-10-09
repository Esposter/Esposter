import { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import { claimFleetEntry } from "#src/services/fleet/claimFleetEntry";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { holdFleetEntry } from "#src/services/fleet/holdFleetEntry";
import { readRequiredMachineProfile } from "#src/services/fleet/readMachineProfile";
import { readMachineSample } from "#src/services/fleet/readMachineSample";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:hold <id>` — claims an entry, then renews the claim every ten minutes until its ref is deleted or the
// Process is killed. A runner starts it in the background for the entry it works (the throughput skill, `references/fleet.md`)
await runMain(
  defineCommand({
    args: { id: { description: "The entry's id", required: true, type: "positional" } },
    meta: { description: "Claim an entry and renew the claim every ten minutes until it is released", name: "hold" },
    run: async ({ args }) => {
      const profile = readRequiredMachineProfile();
      const sample = await readMachineSample();
      const load = formatMachineLoad(sample.cpuPercentage, sample.gpuPercentage, sample.freeGigabytes);
      const { attempt, claimed } = claimFleetEntry(args.id, profile.id, load);
      if (attempt === ClaimAttempt.Held) {
        console.info(`${args.id} is held by ${claimed.message.machine}, so it is not held here`);
        process.exitCode = 1;
        return;
      }
      console.info(`holding ${args.id}`);
      await holdFleetEntry(args.id, profile.id);
    },
  }),
);
