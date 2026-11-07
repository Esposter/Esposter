import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { buildEnemyKinds } from "#src/services/genshinAssets/enemies/buildEnemyKinds";
import { fetchEnemyWikiPages } from "#src/services/genshinAssets/enemies/fetchEnemyWikiPages";
import { parseEnemyKinds } from "#src/services/genshinAssets/enemies/parseEnemyKinds";
import { toEnemyWikiPageTitles } from "#src/services/genshinAssets/enemies/toEnemyWikiPageTitles";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { defineCommand } from "citty";
import { GameLanguage } from "genshin-text";

export const enemyPagesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Fetch into the wiki cache the enemy family pages, the boss pages, the drops module and the article of every kind that is not a boss, leaving each page the cache holds untouched",
    name: "enemy-pages",
  },
  run: async ({ args }) => {
    const titles = toEnemyWikiPageTitles(parseEnemyKinds(await buildEnemyKinds()), readTextMap(GameLanguage.English));
    console.log(await fetchEnemyWikiPages(titles, args["dry-run"]));
  },
});
