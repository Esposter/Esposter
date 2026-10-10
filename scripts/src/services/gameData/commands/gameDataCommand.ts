import type { CommandDef } from "citty";

import { authoredCommand } from "#src/services/gameData/commands/authoredCommand";
import { pruneCommand } from "#src/services/gameData/commands/pruneCommand";
import { verifyCommand } from "#src/services/gameData/commands/verifyCommand";
import { defineCommand } from "citty";

// The hosted game data's tool, which checks and prunes what the lock names in both accounts, and publishes the world's
// Authored files
export const gameDataCommand: CommandDef = defineCommand({
  meta: {
    description:
      "Check and prune the game data published to both accounts, which the lock names, and publish the world's authored files to it",
    name: "genshin:data",
  },
  subCommands: { authored: authoredCommand, prune: pruneCommand, verify: verifyCommand },
});
