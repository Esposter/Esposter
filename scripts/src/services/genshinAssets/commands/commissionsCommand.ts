import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildMondstadtCommissions } from "#src/services/genshinAssets/commissions/buildMondstadtCommissions";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const commissionsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish Mondstadt's daily tasks from the dump to the game data: each task, its reward tiers and Katheryne's bonus by Adventure Rank band",
    name: "commissions",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildMondstadtCommissions() },
        scopes: [GameDataset.Commissions],
      }),
    );
  },
});
