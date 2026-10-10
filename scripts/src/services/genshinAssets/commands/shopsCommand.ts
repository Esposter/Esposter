import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildMondstadtGeneralGoods } from "#src/services/genshinAssets/shops/buildMondstadtGeneralGoods";
import { buildPaimonsBargainsGoods } from "#src/services/genshinAssets/shops/buildPaimonsBargainsGoods";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const shopsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish Paimon's Bargains' Fates bought with Masterless Starglitter or Stardust and the Mondstadt grocery's general goods from the dump to the game data",
    name: "shops",
  },
  run: async ({ args }) => {
    const objects = { ...buildPaimonsBargainsGoods(), ...buildMondstadtGeneralGoods() };
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Shops],
      }),
    );
  },
});
