import type { CommandDef } from "citty";

import { pruneCommand } from "#src/services/gameData/commands/pruneCommand";
import { verifyCommand } from "#src/services/gameData/commands/verifyCommand";
import { defineCommand } from "citty";

// The hosted game data's tool, which checks and prunes what the lock names in both accounts
export const gameDataCommand: CommandDef = defineCommand({
  meta: {
    description: "Check and prune the game data published to both accounts, which the lock names",
    name: "genshin:data",
  },
  subCommands: { prune: pruneCommand, verify: verifyCommand },
});
