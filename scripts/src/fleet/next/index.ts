import { claimNextFleetEntry } from "#src/services/fleet/claimNextFleetEntry";
import { createFleetWorker } from "#src/services/fleet/createFleetWorker";
import { checkIsFleetEntryKind } from "#src/services/fleet/filterFleetEntries";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:next [--lane <lane>] [--kind <queue|unit>]` — claims the first entry this worker may take and prints its
// Id and the worker id, or prints nothing when none is takeable, which leaves the machine idle (the throughput skill,
// `references/fleet.md`). The worker id is FLEET_WORKER, or a new one when the environment gives none; a runner passes it
// To hold and release the entry. A runner names its lane, so a page runner never claims a cpu item; a skipped queue line is
// Warned about on stderr
await runMain(
  defineCommand({
    args: {
      kind: { default: "", description: "Only entries of this kind, queue or unit; any when empty", type: "string" },
      lane: {
        default: "",
        description: "Only queue items on this lane, such as page or cpu; any when empty",
        type: "string",
      },
    },
    meta: {
      description: "Claim the first entry this machine may take and print its id, or print nothing",
      name: "next",
    },
    run: async ({ args }) => {
      if (args.kind !== "" && !checkIsFleetEntryKind(args.kind))
        throw new InvalidOperationError(Operation.Read, args.kind, "--kind is queue or unit");
      const worker = process.env.FLEET_WORKER || createFleetWorker();
      const entry = await claimNextFleetEntry(args.lane, args.kind, worker);
      if (entry !== undefined) console.info(`claimed ${entry.id} as worker ${worker}`);
    },
  }),
);
