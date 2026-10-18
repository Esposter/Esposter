import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildHomeAreas } from "#src/services/genshinAssets/home/buildHomeAreas";
import { buildHomeEvents } from "#src/services/genshinAssets/home/buildHomeEvents";
import { buildHomeFurnishings } from "#src/services/genshinAssets/home/buildHomeFurnishings";
import { buildHomeGardens } from "#src/services/genshinAssets/home/buildHomeGardens";
import { buildHomeRules } from "#src/services/genshinAssets/home/buildHomeRules";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const homeCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the Serenitea Pot's furnishing blueprints, the diagrams that open them, the Trust and Adeptal Energy ranks, the garden's fields and plants, the companions' favoured furnishing sets with their rewards, and the load each realm area holds and each furnishing takes from the dump to the game data",
    name: "home",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: {
          indexes: {},
          objects: {
            ...buildHomeRules(),
            ...buildHomeGardens(),
            ...buildHomeAreas(),
            ...buildHomeEvents(),
            ...buildHomeFurnishings(),
          },
        },
        scopes: [GameDataset.Home],
      }),
    );
  },
});
