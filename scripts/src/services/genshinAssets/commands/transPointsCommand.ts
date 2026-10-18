import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildTransPointRewards } from "#src/services/genshinAssets/transPoints/buildTransPointRewards";
import { buildTransPointUnlocks } from "#src/services/genshinAssets/transPoints/buildTransPointUnlocks";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const transPointsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the open world's transport points from the dump to the game data: the Adventure EXP and Primogems each first unlock pays, and the points the unlock table lists",
    name: "trans-points",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: { ...buildTransPointRewards(), ...buildTransPointUnlocks() } },
        scopes: [GameDataset.TransPoints],
      }),
    );
  },
});
