import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildCookingRecipes } from "#src/services/genshinAssets/cooking/buildCookingRecipes";
import { buildProcessingRecipes } from "#src/services/genshinAssets/cooking/buildProcessingRecipes";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const cookingCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the dishes (with their specialties and the instructions that teach them) and the processings from the dump to the game data",
    name: "cooking",
  },
  run: async ({ args }) => {
    const objects = { ...buildCookingRecipes(), ...buildProcessingRecipes() };
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Cooking],
      }),
    );
  },
});
