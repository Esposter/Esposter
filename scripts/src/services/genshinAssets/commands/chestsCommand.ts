import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildChestPlaces } from "#src/services/genshinAssets/chests/buildChestPlaces";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const chestsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each chest the official map marks, carried into the scene by the fit, as one slice per region to the game data",
    name: "chests",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildChestPlaces();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Chests],
      }),
    );
  },
});
