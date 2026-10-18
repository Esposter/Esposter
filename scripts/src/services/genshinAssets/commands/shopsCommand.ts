import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildMondstadtGeneralGoods } from "#src/services/genshinAssets/shops/buildMondstadtGeneralGoods";
import { buildPaimonsBargainsGoods } from "#src/services/genshinAssets/shops/buildPaimonsBargainsGoods";
import { buildPaimonsBargainsRotation } from "#src/services/genshinAssets/shops/buildPaimonsBargainsRotation";
import { buildRealmDepotGoods } from "#src/services/genshinAssets/shops/buildRealmDepotGoods";
import { buildSouvenirGoods } from "#src/services/genshinAssets/shops/buildSouvenirGoods";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const shopsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish Paimon's Bargains' Fates bought with Masterless Starglitter or Stardust, its rotation of characters and weapons, the Mondstadt grocery's general goods, the Realm Depot's goods and the Souvenir Shops' goods from the dump to the game data",
    name: "shops",
  },
  run: async ({ args }) => {
    const objects = {
      ...buildPaimonsBargainsGoods(),
      ...buildPaimonsBargainsRotation(),
      ...buildMondstadtGeneralGoods(),
      ...buildRealmDepotGoods(),
      ...buildSouvenirGoods(),
    };
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Shops],
      }),
    );
  },
});
