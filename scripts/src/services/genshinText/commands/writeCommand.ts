import type { SubCommandsDef } from "citty";

import { writeGameText } from "#src/services/genshinText/writeGameText";
import { defineCommand } from "citty";

export const writeCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write every string GameTextKey names, and the lines of every character the game-data package has none for, in every language",
    name: "write",
  },
  run: () => {
    for (const note of writeGameText()) console.log(note);
  },
});
