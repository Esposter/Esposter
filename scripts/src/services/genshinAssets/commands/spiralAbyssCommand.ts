import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildSpiralAbyss } from "#src/services/genshinAssets/spiralAbyss/buildSpiralAbyss";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const spiralAbyssCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the Spiral Abyss's floors with their chambers, their rewards in every reward group and the Moon Spire's periods from the tower tables to the game data",
    name: "spiral-abyss",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildSpiralAbyss() },
        scopes: [GameDataset.SpiralAbyss],
      }),
    );
  },
});
