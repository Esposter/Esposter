import type { CommandDef } from "citty";

import { clipCommand } from "#src/services/recreation/commands/clipCommand";
import { searchCommand } from "#src/services/recreation/commands/searchCommand";
import { defineCommand } from "citty";

// The game-free tools a recreation of any reference uses, one subcommand a step
export const recreationCommand: CommandDef = defineCommand({
  meta: { description: "The tools a recreation of any reference uses, whatever it recreates", name: "recreation" },
  subCommands: { clip: clipCommand, search: searchCommand },
});
