import { FleetEntryKind } from "#src/models/fleet/FleetEntryKind";
import { claimNextFleetEntry } from "#src/services/fleet/claimNextFleetEntry";
import { createFleetWorker } from "#src/services/fleet/createFleetWorker";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:fleet:next [--lane <lane>] [--kind <queue|unit>]` — claims the first entry this worker may take, lowest phase
// First, and prints its id and the worker id, or prints nothing when none is takeable, which leaves the machine idle (the throughput skill,
// `references/fleet.md`). The worker id is FLEET_WORKER, or a new one when the environment gives none; a runner passes it
// To hold and release the entry. A runner names its lane, so a page runner never claims a cpu item; a skipped queue line is
// Warned about on stderr
await runCommand(
  defineCommand({
    args: {
      kind: {
        description: "Only entries of this kind, queue or unit; any when omitted",
        options: Object.values(FleetEntryKind),
        type: "enum",
      },
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
      const worker = process.env.FLEET_WORKER || createFleetWorker();
      const entry = await claimNextFleetEntry(args.lane, args.kind, worker);
      if (entry !== undefined) console.info(`claimed ${entry.id} as worker ${worker}`);
    },
  }),
);
