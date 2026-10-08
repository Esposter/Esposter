import type { SubCommandsDef } from "citty";

import { writeCookingRecipes } from "#src/services/genshinAssets/cooking/writeCookingRecipes";
import { writeProcessingRecipes } from "#src/services/genshinAssets/cooking/writeProcessingRecipes";
import { defineCommand } from "citty";

export const cookingCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the dishes (with their specialties and the instructions that teach them) and the processings from the dump into genshin-world",
    name: "cooking",
  },
  run: () => {
    writeCookingRecipes();
    writeProcessingRecipes();
  },
});
