import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildAdventureRankTables } from "#src/services/genshinAssets/adventureRank/buildAdventureRankTables";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const rankCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the Adventure Rank tables (each rank's EXP, the World Level locks and the enemies' World Level levels) from the dump to the game data",
    name: "rank",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildAdventureRankTables() },
        scopes: [GameDataset.AdventureRank],
      }),
    );
  },
});
