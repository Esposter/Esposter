import type { CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { warmSnapshot } from "@/services/cli/warmSnapshot";
import { defineCommand } from "citty";
import process from "node:process";
// `virrun snapshot` — provisions the os backend's warm dependency snapshot for the current lockfile ahead of time
// (the CI warm-up, equivalent to `virrun -- true`). A no-op announcing itself on any non-os resolved backend.
export const snapshotCommand: CommandDef = defineCommand({
  meta: {
    description: "Provision the os backend's warm dependency snapshot for the current lockfile.",
    name: CommandType.Snapshot,
  },
  run: async () => {
    process.exitCode = await warmSnapshot();
  },
});
