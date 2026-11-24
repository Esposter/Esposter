import type { SubCommandsDef } from "citty";

import { mergeGameDataBuilds } from "#src/services/gameData/mergeGameDataBuilds";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildFishingPoints } from "#src/services/genshinAssets/fishing/buildFishingPoints";
import { buildFishingProps } from "#src/services/genshinAssets/fishing/buildFishingProps";
import { buildFishingTables } from "#src/services/genshinAssets/fishing/buildFishingTables";
import { readCityRegionMap } from "#src/services/genshinAssets/shared/readCityRegionMap";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world/definitions";

export const fishingCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the fishing points of the official map by region, the fish, their rods, each region's fishing pools and the fishing-area props placed in each region to the game data",
    name: "fishing",
  },
  run: async ({ args }) => {
    const { notes, objects } = mergeGameDataBuilds([
      await buildFishingPoints(),
      buildFishingTables(await readCityRegionMap()),
      await buildFishingProps(),
    ]);
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
