import type { CommandDef } from "citty";

import { publishCommand } from "#src/services/genshinCharacters/commands/publishCommand";
import { defineCommand } from "citty";

// The characters' official model packs, published to both accounts' app assets and named in the game data lock
export const genshinCharactersCommand: CommandDef = defineCommand({
  meta: {
    description: "Publish the characters' official MMD packs to both accounts, each under its content hash",
    name: "genshin:characters",
  },
  subCommands: { publish: publishCommand },
});
