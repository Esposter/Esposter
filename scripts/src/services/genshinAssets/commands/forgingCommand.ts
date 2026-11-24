import type { SubCommandsDef } from "citty";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildForgingDailyPointCap } from "#src/services/genshinAssets/forging/buildForgingDailyPointCap";
import { buildForgingRecipes } from "#src/services/genshinAssets/forging/buildForgingRecipes";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world/definitions";

export const forgingCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the blacksmith's recipes (the enhancement ores and the four-star weapons from their billets), the diagrams that open them and the game day's forge point cap from the dump to the game data",
    name: "forging",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: { ...buildForgingRecipes(), ...buildForgingDailyPointCap() } },
        scopes: [GameDataset.Forging],
      }),
    );
  },
});
