import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildImaginarium } from "#src/services/genshinAssets/imaginarium/buildImaginarium";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const imaginariumCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the Imaginarium Theater's seasons, each naming its difficulties, and every difficulty's level floor from the role combat tables to the game data",
    name: "imaginarium",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildImaginarium() },
        scopes: [GameDataset.Imaginarium],
      }),
    );
  },
});
