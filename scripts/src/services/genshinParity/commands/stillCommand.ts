import type { SubCommandsDef } from "citty";

import { captureGame } from "#src/services/genshinParity/game/captureGame";
import { defineCommand } from "citty";

export const stillCommand: SubCommandsDef[string] = defineCommand({
  args: { name: { description: "The still's file name", required: true, type: "positional" } },
  meta: { description: "The game's window, once", name: "still" },
  run: ({ args }) => captureGame(args.name),
});
