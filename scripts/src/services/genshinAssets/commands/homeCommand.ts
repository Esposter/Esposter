import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildHomeRules } from "#src/services/genshinAssets/home/buildHomeRules";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const homeCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the Serenitea Pot's furnishing blueprints, the diagrams that open them and the Trust and Adeptal Energy ranks from the dump to the game data",
    name: "home",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildHomeRules() },
        scopes: [GameDataset.Home],
      }),
    );
  },
});
