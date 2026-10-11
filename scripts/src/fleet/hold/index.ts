import { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import { claimFleetEntryHere } from "#src/services/fleet/claimFleetEntryHere";
import { formatClaimHolder } from "#src/services/fleet/formatClaimHolder";
import { holdFleetEntry } from "#src/services/fleet/holdFleetEntry";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:fleet:hold <id> [--worker <id>]` — claims an entry for this worker, then renews the claim every ten minutes
// Until its ref is deleted or the process is killed. A runner starts it in the background for the entry it works, with
// The worker id `next` printed (the throughput skill, `references/fleet.md`)
await runCommand(
  defineCommand({
    args: {
      id: { description: "The entry's id", required: true, type: "positional" },
      worker: { default: "", description: "The worker holding the entry; FLEET_WORKER when empty", type: "string" },
    },
    meta: { description: "Claim an entry and renew the claim every ten minutes until it is released", name: "hold" },
    run: async ({ args }) => {
      const { attempt, claimed, holder } = await claimFleetEntryHere(args.id, args.worker);
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
