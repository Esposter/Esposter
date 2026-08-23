import type { CommandDef } from "citty";

import { CommandType } from "#src/models/virrun/CommandType";
import { warmCache } from "#src/services/cli/run/warmCache";
import { defineCommand } from "citty";
// Provisions the warm cache ahead of time (the CI warm-up, equivalent to `virrun -- true`); a no-op announcing
// Itself on any non-os backend.
export const warmCommand: CommandDef = defineCommand({
  meta: {
    description:
      "Provision the os backend's warm cache (dependency snapshot + prepare layer) for the current lockfile.",
    name: CommandType.Warm,
  },
  run: async () => {
    process.exitCode = await warmCache();
  },
});
