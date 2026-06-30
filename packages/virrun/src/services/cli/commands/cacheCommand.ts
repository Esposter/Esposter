import type { CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { cacheCleanCommand } from "@/services/cli/commands/cacheCleanCommand";
import { cacheLsCommand } from "@/services/cli/commands/cacheLsCommand";
import { defineCommand } from "citty";
// No own run, so an argless `virrun cache` prints citty's generated usage.
export const cacheCommand: CommandDef = defineCommand({
  meta: {
    description: "Inspect or clear virrun's dependency store and warm snapshots.",
    name: CommandType.Cache,
  },
  subCommands: { [CommandType.Clean]: cacheCleanCommand, [CommandType.Ls]: cacheLsCommand },
});
