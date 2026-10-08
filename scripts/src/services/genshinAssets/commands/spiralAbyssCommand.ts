import type { SubCommandsDef } from "citty";

import { writeSpiralAbyss } from "#src/services/genshinAssets/spiralAbyss/writeSpiralAbyss";
import { defineCommand } from "citty";

export const spiralAbyssCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the Spiral Abyss's floors with their chambers, their rewards in every reward group and the Moon Spire's periods from the tower tables into genshin-world",
    name: "spiral-abyss",
  },
  run: () => {
    writeSpiralAbyss();
  },
});
