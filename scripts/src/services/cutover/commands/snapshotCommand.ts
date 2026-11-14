import type { SubCommandsDef } from "citty";

import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { runSnapshot } from "#src/services/cutover/snapshot/runSnapshot";
import { defineCommand } from "citty";

export const snapshotCommand: SubCommandsDef[string] = defineCommand({
  args: { ...environmentArgs },
  meta: {
    description: "Dump Postgres and export every Azure Table as JSON lines into the private archive bucket",
    name: "snapshot",
  },
  run: async ({ args }) => {
    await runSnapshot(args.environment);
  },
});
