import type { CommandDef } from "citty";

import { decodeCommand } from "#src/services/genshinText/commands/decodeCommand";
import { fetchCommand } from "#src/services/genshinText/commands/fetchCommand";
import { findCommand } from "#src/services/genshinText/commands/findCommand";
import { gcgTextCommand } from "#src/services/genshinText/commands/gcgTextCommand";
import { namesCommand } from "#src/services/genshinText/commands/namesCommand";
import { questsCommand } from "#src/services/genshinText/commands/questsCommand";
import { standingTalksCommand } from "#src/services/genshinText/commands/standingTalksCommand";
import { writeCommand } from "#src/services/genshinText/commands/writeCommand";
import { defineCommand } from "citty";

// The game text's tool (openspec/specs/genshin/game-text/design.md)
export const genshinTextCommand: CommandDef = defineCommand({
  meta: {
    description:
      "Find the game's own strings and write the ones referenced, the world's quests, the residents' standing talks, its tables' names and the card game's words, in every language",
    name: "genshin:text",
  },
  subCommands: {
    decode: decodeCommand,
    fetch: fetchCommand,
    find: findCommand,
    gcg: gcgTextCommand,
    names: namesCommand,
    quests: questsCommand,
    "standing-talks": standingTalksCommand,
    write: writeCommand,
  },
});
