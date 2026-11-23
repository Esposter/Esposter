import type { SubCommandsDef } from "citty";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildEnemyDropSources } from "#src/services/genshinAssets/enemies/buildEnemyDropSources";
import { buildEnemyKinds } from "#src/services/genshinAssets/enemies/buildEnemyKinds";
import { buildReactionPoise } from "#src/services/genshinAssets/enemies/buildReactionPoise";
import { parseEnemyKinds } from "#src/services/genshinAssets/enemies/parseEnemyKinds";
import { readMaterialIdsByName } from "#src/services/genshinAssets/enemies/readMaterialIdsByName";
import { toDropFamilyLines } from "#src/services/genshinAssets/enemies/toDropFamilyLines";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";
import { GameLanguage } from "genshin-text";
import { GameDataset } from "genshin-world";

export const enemiesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the enemy kinds the regions' camps place and the Mondstadt bounties hunt, read from the game's monster, curve and archive tables in the text dump, each with the drop source its wiki article gives, a drop family, a Drops template's materials or a boss's reward, and every level curve they name, the poise each transformative reaction deals and each drop family's table, to the game data",
    name: "enemies",
  },
  run: async ({ args }) => {
    const enemyKindRecords = await buildEnemyKinds();
    const enemyKinds = parseEnemyKinds(enemyKindRecords);
    const englishTextMap = readTextMap(GameLanguage.English);
    const { dropFamilies, dropFamilyKinds, enemyKindRows } = buildEnemyDropSources(
      enemyKinds,
      englishTextMap,
      readMaterialIdsByName(englishTextMap),
    );
    console.log(toDropFamilyLines(dropFamilies, dropFamilyKinds, enemyKinds, englishTextMap).join("\n"));
    const objects = {
      ...enemyKindRecords,
      [`${GameDataset.Enemies}/kinds`]: enemyKindRows,
      ...buildReactionPoise(),
      [`${GameDataset.Enemies}/dropFamilies`]: dropFamilies,
      [`${GameDataset.Enemies}/dropFamilyKinds`]: dropFamilyKinds,
    };
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Enemies],
      }),
    );
  },
});
