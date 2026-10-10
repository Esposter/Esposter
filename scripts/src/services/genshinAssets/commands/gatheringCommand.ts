import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildGatheringPlaces } from "#src/services/genshinAssets/gathering/buildGatheringPlaces";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const gatheringCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each plant and specialty the official map marks, placed by the fit, as one slice per region and its items to the game data",
    name: "gathering",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildGatheringPlaces();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Gathering],
      }),
    );
  },
});
