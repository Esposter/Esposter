import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildMondstadtReputation } from "#src/services/genshinAssets/reputation/buildMondstadtReputation";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const reputationCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish Mondstadt's Reputation from the dump to the game data: its levels and rewards, its requests, its exploration thresholds and its weekly bounties",
    name: "reputation",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildMondstadtReputation() },
        scopes: [GameDataset.Reputation],
      }),
    );
  },
});
