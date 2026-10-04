import type { SubCommandsDef } from "citty";

import { launchGame } from "#src/services/genshinParity/game/launchGame";
import { defineCommand } from "citty";

export const launchCommand: SubCommandsDef[string] = defineCommand({
  meta: { description: "Start the game, which asks for elevation", name: "launch" },
  run: () => {
    launchGame();
  },
});
