import type { SubCommandsDef } from "citty";

import { RECORD_DEFAULT_SECONDS } from "#src/services/genshinParity/commands/constants";
import { captureGame } from "#src/services/genshinParity/game/captureGame";
import { parseWholeCount } from "#src/services/shared/parseWholeCount";
import { defineCommand } from "citty";

export const recordCommand: SubCommandsDef[string] = defineCommand({
  args: {
    name: { description: "The recording's file name", required: true, type: "positional" },
    seconds: {
      default: String(RECORD_DEFAULT_SECONDS),
      description: "How long to record once the window opens",
      required: false,
      type: "positional",
    },
  },
  meta: { description: "The game's window once it opens, for a length of time", name: "record" },
  run: ({ args }) => captureGame(args.name, parseWholeCount(args.seconds, "seconds", 1)),
});
