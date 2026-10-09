import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildFishingPoints } from "#src/services/genshinAssets/fishing/buildFishingPoints";
import { buildFishingTables } from "#src/services/genshinAssets/fishing/buildFishingTables";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const fishingCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the fishing points of the official map by region, the fish, their rods and each region's fishing pools to the game data",
    name: "fishing",
  },
  run: async ({ args }) => {
    const { notes, objects } = mergeGameDataBuilds([await buildFishingPoints(), buildFishingTables()]);
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Fishing],
      }),
    );
  },
});
