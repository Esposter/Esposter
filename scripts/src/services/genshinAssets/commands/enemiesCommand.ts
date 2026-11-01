import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildEnemyKinds } from "#src/services/genshinAssets/enemies/buildEnemyKinds";
import { buildReactionPoise } from "#src/services/genshinAssets/enemies/buildReactionPoise";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const enemiesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the enemy kinds the regions' camps place and the Mondstadt bounties hunt, read from the game's monster, curve and archive tables in the text dump, and every level curve they name, and the poise each transformative reaction deals, to the game data",
    name: "enemies",
  },
  run: async ({ args }) => {
    const objects = { ...(await buildEnemyKinds()), ...buildReactionPoise() };
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Enemies],
      }),
    );
  },
});
