import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { findSharedLabelRows } from "#src/services/genshinAssets/kits/wiki/findSharedLabelRows";
import { describe, expect, test } from "vitest";

describe(findSharedLabelRows, () => {
  test("gives each of two hits sharing `4-Hit DMG` the row numbered as its place, where their poise differs", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { poise: 26.96, row: 1, title: "4-Hit DMG 1" },
      { poise: 10, row: 2, title: "4-Hit DMG 2" },
    ];

    expect(findSharedLabelRows("4-Hit DMG", properties, ["burst.hits.0", "burst.hits.1"])).toStrictEqual(
      new Map([
        ["burst.hits.0", [properties[0]]],
        ["burst.hits.1", [properties[1]]],
      ]),
    );
  });

  test("gives the first five of eighteen arrows no label finds the row titled `5 Main Arrows`, the rest `13 Sub Arrows`", () => {
    expect.hasAssertions();

    const mainRow: WikiAdvancedProperty = { poise: 7.22, row: 1, title: "5 Main Arrows" };
    const subRow: WikiAdvancedProperty = { poise: 7.22, row: 2, title: "13 Sub Arrows" };
    const hitPaths = Array.from({ length: 18 }, (_hit, index) => `hits.fieryRainArrows.${index}`);

    expect(findSharedLabelRows("Fiery Rain DMG Per Wave", [mainRow, subRow], hitPaths)).toStrictEqual(
      new Map(
        hitPaths.map((hitPath, index): [string, WikiAdvancedProperty[]] => [hitPath, [index < 5 ? mainRow : subRow]]),
      ),
    );
  });

  test("gives no row to hits no label finds where the counts of the rows titled with counts miss the hits", () => {
    expect.hasAssertions();

    const hitPaths = ["hits.fieryRainArrows.0", "hits.fieryRainArrows.1", "hits.fieryRainArrows.2"];

    expect(
      findSharedLabelRows(
        "Fiery Rain DMG Per Wave",
        [
          { poise: 7.22, row: 1, title: "5 Main Arrows" },
          { poise: 7.22, row: 2, title: "13 Sub Arrows" },
        ],
        hitPaths,
      ),
    ).toStrictEqual(new Map(hitPaths.map((hitPath): [string, WikiAdvancedProperty[]] => [hitPath, []])));
  });
});
