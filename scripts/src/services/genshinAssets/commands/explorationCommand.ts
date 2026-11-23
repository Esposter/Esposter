import type { SubCommandsDef } from "citty";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildMondstadtExplorationAreas } from "#src/services/genshinAssets/exploration/buildMondstadtExplorationAreas";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const explorationCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish Mondstadt's areas' exploration (each total and the doings its progress counts) from the dump to the game data",
    name: "exploration",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildMondstadtExplorationAreas() },
        scopes: [GameDataset.Exploration],
      }),
    );
  },
});
