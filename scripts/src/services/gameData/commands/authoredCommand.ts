import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { AGE_RATING_KEY } from "#src/services/gameData/constants";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { readAuthoredGameData } from "#src/services/gameData/readAuthoredGameData";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const authoredCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the world's authored data files, which no step generates, from their committed sources to the game data",
    name: "authored",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: await readAuthoredGameData() },
        scopes: [GameDataset.Catalogue, GameDataset.Ground, AGE_RATING_KEY],
      }),
    );
  },
});
