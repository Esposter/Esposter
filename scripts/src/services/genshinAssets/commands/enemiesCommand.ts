import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildEnemyKinds } from "#src/services/genshinAssets/enemies/buildEnemyKinds";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const enemiesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the enemy kinds the regions' camps place, read from the game's monster, curve and archive tables in the text dump, and every level curve they name, to the game data",
    name: "enemies",
  },
  run: async ({ args }) => {
    const objects = await buildEnemyKinds();
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Enemies],
      }),
    );
  },
});
