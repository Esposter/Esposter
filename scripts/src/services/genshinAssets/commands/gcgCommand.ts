import type { SubCommandsDef } from "citty";

import { writeGcgStandardRule } from "#src/services/genshinAssets/gcg/writeGcgStandardRule";
import { defineCommand } from "citty";

export const gcgCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Write the standard duel rule (its draw, hand limit and reactions) from the dump into genshin-world",
    name: "gcg",
  },
  run: () => {
    writeGcgStandardRule();
  },
});
