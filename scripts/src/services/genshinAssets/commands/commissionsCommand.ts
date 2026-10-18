import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildCommissions } from "#src/services/genshinAssets/commissions/buildCommissions";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const commissionsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish every region's daily tasks from the dump to the game data: each task, its reward tiers and Katheryne's bonus by Adventure Rank band",
    name: "commissions",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildCommissions() },
        scopes: [GameDataset.Commissions],
      }),
    );
  },
});
