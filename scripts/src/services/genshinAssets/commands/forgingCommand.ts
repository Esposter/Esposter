import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildForgingRecipes } from "#src/services/genshinAssets/forging/buildForgingRecipes";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const forgingCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the blacksmith's recipes (the enhancement ores and the four-star weapons from their billets) and the diagrams that open them from the dump to the game data",
    name: "forging",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildForgingRecipes() },
        scopes: [GameDataset.Forging],
      }),
    );
  },
});
