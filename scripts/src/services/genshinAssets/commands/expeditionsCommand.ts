import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildExpeditionLimits } from "#src/services/genshinAssets/expeditions/buildExpeditionLimits";
import { buildMondstadtExpeditions } from "#src/services/genshinAssets/expeditions/buildMondstadtExpeditions";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const expeditionsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish Mondstadt's expedition places (their conditions, durations and reward items) and the Adventure Ranks that raise the expedition limit to the game data",
    name: "expeditions",
  },
  run: async ({ args }) => {
    const objects = { ...buildMondstadtExpeditions(), ...buildExpeditionLimits() };
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Expeditions],
      }),
    );
  },
});
