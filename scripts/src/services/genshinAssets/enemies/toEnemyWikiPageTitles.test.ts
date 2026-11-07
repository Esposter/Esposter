import { DROPS_TABLE_WIKI_MODULE_TITLE } from "#src/services/genshinAssets/enemies/constants";
import { toEnemyWikiPageTitles } from "#src/services/genshinAssets/enemies/toEnemyWikiPageTitles";
import { EnemyType } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toEnemyWikiPageTitles, () => {
  test("the drops module and each non-boss kind's English name are the pages, each once, and a boss's name is none", () => {
    expect.hasAssertions();
    const englishTextMap = new Map([
      ["1", "Hilichurls"],
      ["2", "Hilichurl Fighter"],
      ["3", "Stormterror"],
    ]);

    expect(
      toEnemyWikiPageTitles(
        [
          { enemyType: EnemyType.Common, id: 21010101, nameTextId: "2" },
          { enemyType: EnemyType.Common, id: 21010201, nameTextId: "1" },
          { enemyType: EnemyType.Boss, id: 29010104, nameTextId: "3" },
        ],
        englishTextMap,
      ),
    ).toStrictEqual([DROPS_TABLE_WIKI_MODULE_TITLE, "Hilichurl Fighter", "Hilichurls"]);
  });
});
