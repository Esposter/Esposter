import { missFleetEntry } from "#src/services/fleet/missFleetEntry";
import { readRequiredMachineProfile } from "#src/services/fleet/readMachineProfile";
import { releaseFleetEntry } from "#src/services/fleet/releaseFleetEntry";
import { requireFleetWorker } from "#src/services/fleet/requireFleetWorker";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:release <id> [--miss "<text>"] [--worker <id>]` — deletes an entry's claim, or with a miss keeps it as the
// Holder's final word, which the stale takeover never takes. Only the worker holding the claim may release it, and only
// Its own hold stops (the throughput skill, `references/fleet.md`)
await runMain(
  defineCommand({
    args: {
      id: { description: "The entry's id", required: true, type: "positional" },
      miss: {
        description: "Why the entry was missed, which keeps its claim for the coordinator's call",
        type: "string",
      },
      worker: { default: "", description: "The worker holding the entry; FLEET_WORKER when empty", type: "string" },
    },
    meta: { description: "Release an entry's claim, or record a miss on it", name: "release" },
    run: ({ args }) => {
      const holder = { machine: readRequiredMachineProfile().id, worker: requireFleetWorker(args.worker) };
      if (args.miss === undefined) {
        releaseFleetEntry(args.id, holder);
        console.info(`released ${args.id}`);
        return;
      }
      missFleetEntry(args.id, args.miss, holder);
      console.info(`missed ${args.id}: ${args.miss}`);
    },
  }),
);
