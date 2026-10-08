import type { SubCommandsDef } from "citty";

import { writeStatTables } from "#src/services/genshinAssets/stats/writeStatTables";
import { defineCommand } from "citty";

export const statsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the characters', weapons' and artifacts' attribute tables from the dump's game tables into genshin-world",
    name: "stats",
  },
  run: () => {
    for (const note of writeStatTables()) console.log(note);
  },
});
