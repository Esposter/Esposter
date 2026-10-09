import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildTransPointRewards } from "#src/services/genshinAssets/transPoints/buildTransPointRewards";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const transPointsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the open world's transport point rewards (the Adventure EXP and Primogems each first unlock pays) from the dump to the game data",
    name: "trans-points",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildTransPointRewards() },
        scopes: [GameDataset.TransPoints],
      }),
    );
  },
});
