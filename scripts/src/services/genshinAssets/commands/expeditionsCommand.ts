import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildExpeditionBonuses } from "#src/services/genshinAssets/expeditions/buildExpeditionBonuses";
import { buildExpeditionPassives } from "#src/services/genshinAssets/expeditions/buildExpeditionPassives";
import { buildExpeditionLimits } from "#src/services/genshinAssets/expeditions/buildExpeditionLimits";
import { buildMondstadtExpeditions } from "#src/services/genshinAssets/expeditions/buildMondstadtExpeditions";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const expeditionsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish Mondstadt's expedition places (their conditions, durations and reward items), the Adventure Ranks that raise the expedition limit, the expedition bonus's chance by level and the expedition talents to the game data",
    name: "expeditions",
  },
  run: async ({ args }) => {
    const objects = {
      ...buildExpeditionBonuses(),
      ...buildExpeditionLimits(),
      ...buildExpeditionPassives(),
      ...buildMondstadtExpeditions(),
    };
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Expeditions],
      }),
    );
  },
});
