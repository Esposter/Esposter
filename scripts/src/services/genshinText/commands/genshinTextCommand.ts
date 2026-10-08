import type { CommandDef } from "citty";

import { findCommand } from "#src/services/genshinText/commands/findCommand";
import { namesCommand } from "#src/services/genshinText/commands/namesCommand";
import { questsCommand } from "#src/services/genshinText/commands/questsCommand";
import { writeCommand } from "#src/services/genshinText/commands/writeCommand";
import { defineCommand } from "citty";

// The game text's tool (apps/web/content/docs/genshin/game-text.md)
export const genshinTextCommand: CommandDef = defineCommand({
  meta: {
    description:
      "Find the game's own strings and write the ones referenced, the world's quests and its tables' names, in every language",
    name: "genshin:text",
  },
  subCommands: { find: findCommand, names: namesCommand, quests: questsCommand, write: writeCommand },
});
