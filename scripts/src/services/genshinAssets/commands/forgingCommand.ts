import type { SubCommandsDef } from "citty";

import { writeForgingRecipes } from "#src/services/genshinAssets/forging/writeForgingRecipes";
import { defineCommand } from "citty";

export const forgingCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the blacksmith's recipes (the enhancement ores and the four-star weapons from their billets) and the diagrams that open them from the dump into genshin-world",
    name: "forging",
  },
  run: () => {
    writeForgingRecipes();
  },
});
