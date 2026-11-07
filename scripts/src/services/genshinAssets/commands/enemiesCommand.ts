import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildEnemyDropFamilies } from "#src/services/genshinAssets/enemies/buildEnemyDropFamilies";
import { buildEnemyKinds } from "#src/services/genshinAssets/enemies/buildEnemyKinds";
import { buildReactionPoise } from "#src/services/genshinAssets/enemies/buildReactionPoise";
import { parseEnemyKinds } from "#src/services/genshinAssets/enemies/parseEnemyKinds";
import { readMaterialIdsByName } from "#src/services/genshinAssets/enemies/readMaterialIdsByName";
import { toDropFamilyLines } from "#src/services/genshinAssets/enemies/toDropFamilyLines";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { defineCommand } from "citty";
import { GameLanguage } from "genshin-text";
import { GameDataset } from "genshin-world";

export const enemiesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the enemy kinds the regions' camps place and the Mondstadt bounties hunt, read from the game's monster, curve and archive tables in the text dump, and every level curve they name, the poise each transformative reaction deals, and the drop family each kind's defeat drops, joined from the wiki's Enemies table and the kinds' articles, to the game data",
    name: "enemies",
  },
  run: async ({ args }) => {
    const enemyKindRecords = await buildEnemyKinds();
    const enemyKinds = parseEnemyKinds(enemyKindRecords);
    const englishTextMap = readTextMap(GameLanguage.English);
    const { dropFamilies, dropFamilyKinds } = buildEnemyDropFamilies(
      enemyKinds,
      englishTextMap,
      readMaterialIdsByName(englishTextMap),
    );
    console.log(toDropFamilyLines(dropFamilies, dropFamilyKinds, enemyKinds, englishTextMap).join("\n"));
    const objects = {
      ...enemyKindRecords,
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
