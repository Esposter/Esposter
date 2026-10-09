import type { SubCommandsDef } from "citty";

import { writeGcgText } from "#src/services/genshinText/writeGcgText";
import { defineCommand } from "citty";

export const gcgTextCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Write every name and description the card game's opponent decks name, in every language",
    name: "gcg",
  },
  run: () => {
    for (const note of writeGcgText()) console.log(note);
  },
});
