import { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import { claimFleetEntry } from "#src/services/fleet/claimFleetEntry";
import { formatClaimHolder } from "#src/services/fleet/formatClaimHolder";
import { formatMachineLoad } from "#src/services/fleet/formatMachineLoad";
import { holdFleetEntry } from "#src/services/fleet/holdFleetEntry";
import { readRequiredMachineProfile } from "#src/services/fleet/readMachineProfile";
import { readMachineSample } from "#src/services/fleet/readMachineSample";
import { requireFleetWorker } from "#src/services/fleet/requireFleetWorker";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:hold <id> [--worker <id>]` — claims an entry for this worker, then renews the claim every ten minutes
// Until its ref is deleted or the process is killed. A runner starts it in the background for the entry it works, with
// The worker id `next` printed (the throughput skill, `references/fleet.md`)
await runMain(
  defineCommand({
    args: {
      id: { description: "The entry's id", required: true, type: "positional" },
      worker: { default: "", description: "The worker holding the entry; FLEET_WORKER when empty", type: "string" },
    },
    meta: { description: "Claim an entry and renew the claim every ten minutes until it is released", name: "hold" },
    run: async ({ args }) => {
      const profile = readRequiredMachineProfile();
      const holder = { machine: profile.id, worker: requireFleetWorker(args.worker) };
      const sample = await readMachineSample();
      const load = formatMachineLoad(
        sample.cpuPercentage,
        sample.gpuPercentage,
        sample.freeGigabytes,
        process.platform,
      );
      const { attempt, claimed } = claimFleetEntry(args.id, holder, load);
      if (attempt === ClaimAttempt.Held) {
        console.info(`${args.id} is held by ${formatClaimHolder(claimed.message)}, so it is not held here`);
        process.exitCode = 1;
        return;
      }
      console.info(`holding ${args.id} as worker ${holder.worker}`);
      await holdFleetEntry(args.id, holder);
    },
  }),
);
