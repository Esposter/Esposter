import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildStatueLevels } from "#src/services/genshinAssets/statues/buildStatueLevels";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const statuesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish Mondstadt's Statue of The Seven levels (the Oculi each takes, its rewards and stamina) from the dump to the game data",
    name: "statues",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildStatueLevels() },
        scopes: [GameDataset.StatueLevels],
      }),
    );
  },
});
