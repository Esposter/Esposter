import { ClaimAttempt } from "#src/models/fleet/ClaimAttempt";
import { claimFleetEntryHere } from "#src/services/fleet/claimFleetEntryHere";
import { formatClaimHolder } from "#src/services/fleet/formatClaimHolder";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:claim <id> [--worker <id>]` — takes an entry for this worker as a claim ref on origin. Exit 0 when won,
// Exit 1 naming the holder when a live claim of another worker keeps it (the throughput skill, `references/fleet.md`)
await runMain(
  defineCommand({
    args: {
      id: { description: "The entry's id", required: true, type: "positional" },
      worker: { default: "", description: "The worker taking the entry; FLEET_WORKER when empty", type: "string" },
    },
    meta: { description: "Claim an entry for this worker on origin, or name the worker that holds it", name: "claim" },
    run: async ({ args }) => {
      const { attempt, claimed, holder } = await claimFleetEntryHere(args.id, args.worker);
      if (attempt === ClaimAttempt.Won) {
        console.info(`claimed ${args.id} as worker ${holder.worker}`);
        return;
      }
      console.info(`${args.id} is held by ${formatClaimHolder(claimed.message)} since ${claimed.message.claimedAt}`);
      process.exitCode = 1;
    },
  }),
);
