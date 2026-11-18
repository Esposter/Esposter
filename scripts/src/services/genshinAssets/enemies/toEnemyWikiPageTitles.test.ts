import {
  DROPS_DATA_WIKI_TITLE,
  DROPS_TABLE_WIKI_MODULE_TITLE,
  DROPS_TEMPLATE_WIKI_TITLE,
} from "#src/services/genshinAssets/enemies/constants";
import { toEnemyWikiPageTitles } from "#src/services/genshinAssets/enemies/toEnemyWikiPageTitles";
import { describe, expect, test } from "vitest";

describe(toEnemyWikiPageTitles, () => {
  test("the drops modules, the drops template and every kind's English name, a boss's among them, are the pages to read", () => {
    expect.hasAssertions();
    const englishTextMap = new Map([
      ["1", "Hilichurls"],
      ["2", "Hilichurl Fighter"],
      ["3", "Stormterror"],
    ]);

    expect(
      toEnemyWikiPageTitles(
        [
          { id: 21010101, nameTextId: "2" },
          { id: 21010201, nameTextId: "1" },
          { id: 29010104, nameTextId: "3" },
        ],
        englishTextMap,
      ),
    ).toStrictEqual([
      DROPS_DATA_WIKI_TITLE,
      DROPS_TABLE_WIKI_MODULE_TITLE,
      DROPS_TEMPLATE_WIKI_TITLE,
      "Hilichurl Fighter",
      "Hilichurls",
      "Stormterror",
    ]);
  });
});
