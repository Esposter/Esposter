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
});
