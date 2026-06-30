import type { CommandDef } from "citty";

import { cacheCleanCommand } from "@/services/cli/commands/cacheCleanCommand";
import { cacheLsCommand } from "@/services/cli/commands/cacheLsCommand";
import { defineCommand } from "citty";
// `virrun cache <ls|clean>` — the parent for the cache-management subcommands. No own run, so an argless
// `virrun cache` prints citty's generated usage.
export const cacheCommand: CommandDef = defineCommand({
  meta: {
    description: "Inspect or clear virrun's dependency store and warm snapshots.",
    name: "cache",
  },
  subCommands: { clean: cacheCleanCommand, ls: cacheLsCommand },
});
