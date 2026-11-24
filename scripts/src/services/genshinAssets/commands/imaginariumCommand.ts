import type { SubCommandsDef } from "citty";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildImaginarium } from "#src/services/genshinAssets/imaginarium/buildImaginarium";
import { buildImaginariumStages } from "#src/services/genshinAssets/imaginarium/buildImaginariumStages";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world/definitions";

export const imaginariumCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the Imaginarium Theater's seasons, each naming its difficulties, every difficulty's level floor, and each Easy stage's enemies from the role combat tables and the wiki's season pages to the game data",
    name: "imaginarium",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: { ...buildImaginarium(), ...(await buildImaginariumStages()) } },
        scopes: [GameDataset.Imaginarium],
      }),
    );
  },
});
