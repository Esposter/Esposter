import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { findHitPathRowsMap } from "#src/services/genshinAssets/kits/wiki/findHitPathRowsMap";
import { describe, expect, test } from "vitest";

describe(findHitPathRowsMap, () => {
  test("gives each of two hit fields sharing a label every row the label finds, as each is its own action", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { poise: 26.96, row: 1, title: "4-Hit DMG 1" },
      { poise: 10, row: 2, title: "4-Hit DMG 2" },
    ];

    expect(
      findHitPathRowsMap(
        [
          ["hitFields.fieldA", "4-Hit DMG"],
          ["hitFields.fieldB", "4-Hit DMG"],
        ],
        properties,
      ),
    ).toStrictEqual(
      new Map([
        ["hitFields.fieldA", properties],
        ["hitFields.fieldB", properties],
      ]),
    );
  });
});
