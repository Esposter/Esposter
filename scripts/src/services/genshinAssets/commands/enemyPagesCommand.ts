import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { buildEnemyKinds } from "#src/services/genshinAssets/enemies/buildEnemyKinds";
import { parseEnemyKinds } from "#src/services/genshinAssets/enemies/parseEnemyKinds";
import { readEnemyWikiPages } from "#src/services/genshinAssets/enemies/readEnemyWikiPages";
import { toEnemyWikiPageTitles } from "#src/services/genshinAssets/enemies/toEnemyWikiPageTitles";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { defineCommand } from "citty";
import { GameLanguage } from "genshin-text";

export const enemyPagesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Fetch into the wiki cache the drops modules and the drops template, and the article of every enemy kind, a boss's among them, leaving each page the cache holds untouched",
    name: "enemy-pages",
  },
  run: async ({ args }) => {
    const titles = toEnemyWikiPageTitles(parseEnemyKinds(await buildEnemyKinds()), readTextMap(GameLanguage.English));
    console.log(await readEnemyWikiPages(titles, args["dry-run"]));
  },
});
