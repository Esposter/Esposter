import type { SubCommandsDef } from "citty";

import { writeGameText } from "#src/services/genshinText/writeGameText";
import { defineCommand } from "citty";

export const writeCommand: SubCommandsDef[string] = defineCommand({
  args: {
    "dry-run": {
      default: false,
      description: "Read every string and line and report what a run would write, without writing a file",
      type: "boolean",
    },
  },
  meta: {
    description:
      "Write every string GameTextKey names, and the lines of every character the game-data package has none for, in every language",
    name: "write",
  },
  run: ({ args }) => {
    for (const note of writeGameText({ isDryRun: args["dry-run"] })) console.log(note);
  },
});
