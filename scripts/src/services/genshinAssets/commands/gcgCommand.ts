import type { SubCommandsDef } from "citty";

import { writeGcgStandardRule } from "#src/services/genshinAssets/gcg/writeGcgStandardRule";
import { writeGcgTutorialDeck } from "#src/services/genshinAssets/gcg/writeGcgTutorialDeck";
import { defineCommand } from "citty";

export const gcgCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Write the standard duel rule and the tutorial deck from the dump into genshin-world",
    name: "gcg",
  },
  run: () => {
    writeGcgStandardRule();
    writeGcgTutorialDeck();
  },
});
