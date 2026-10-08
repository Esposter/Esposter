import type { SubCommandsDef } from "citty";

import { writeLeyLineTables } from "#src/services/genshinAssets/leyLine/writeLeyLineTables";
import { defineCommand } from "citty";

export const leyLineCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write each region's ley line outcrops (its two kinds' rules, its groups' places and the sections drawn from) from the dump into genshin-world",
    name: "outcrops",
  },
  run: () => {
    writeLeyLineTables();
  },
});
