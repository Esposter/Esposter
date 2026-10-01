import type { CommandDef } from "citty";

import { findCommand } from "#src/services/genshinText/commands/findCommand";
import { writeCommand } from "#src/services/genshinText/commands/writeCommand";
import { defineCommand } from "citty";

// The game text's tool (apps/web/content/docs/genshin/game-text.md)
export const genshinTextCommand: CommandDef = defineCommand({
  meta: {
    description: "Find the game's own strings and write the ones referenced, in every language",
    name: "genshin:text",
  },
  subCommands: { find: findCommand, write: writeCommand },
});
