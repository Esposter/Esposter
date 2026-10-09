import { missFleetEntry } from "#src/services/fleet/missFleetEntry";
import { releaseFleetEntry } from "#src/services/fleet/releaseFleetEntry";
import { defineCommand, runMain } from "citty";

// `pnpm ai:fleet:release <id> [--miss "<text>"]` — deletes an entry's claim, or with a miss keeps it as the holder's final
// Word, which the stale takeover never takes (the throughput skill, `references/fleet.md`)
await runMain(
  defineCommand({
    args: {
      id: { description: "The entry's id", required: true, type: "positional" },
      miss: {
        description: "Why the entry was missed, which keeps its claim for the coordinator's call",
        type: "string",
      },
    },
    meta: { description: "Release an entry's claim, or record a miss on it", name: "release" },
    run: ({ args }) => {
      if (args.miss === undefined) {
        releaseFleetEntry(args.id);
        console.info(`released ${args.id}`);
        return;
      }
      missFleetEntry(args.id, args.miss);
      console.info(`missed ${args.id}: ${args.miss}`);
    },
  }),
);
