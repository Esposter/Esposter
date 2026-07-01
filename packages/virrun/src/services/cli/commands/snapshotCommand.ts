import type { CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { warmSnapshot } from "@/services/cli/warmSnapshot";
import { defineCommand } from "citty";
// Provisions the warm snapshot ahead of time (the CI warm-up, equivalent to `virrun -- true`); a no-op announcing
// Itself on any non-os backend.
export const snapshotCommand: CommandDef = defineCommand({
  meta: {
    description: "Provision the os backend's warm dependency snapshot for the current lockfile.",
    name: CommandType.Snapshot,
  },
  run: async () => {
    process.exitCode = await warmSnapshot();
  },
});
