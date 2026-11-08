import type { CommandDef } from "citty";

import { planCommand } from "#src/services/gameVersion/commands/planCommand";
import { statusCommand } from "#src/services/gameVersion/commands/statusCommand";
import { defineCommand } from "citty";

// What a new game version leaves stale, and the order its commands run in to regenerate it
export const gameVersionCommand: CommandDef = defineCommand({
  meta: {
    description:
      "List the outputs a new game version leaves stale, by the command that wrote each, and plan the commands that regenerate them",
    name: "genshin:version",
  },
  subCommands: { plan: planCommand, status: statusCommand },
});
