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

  test("gives each plunge variant's leap the row its level names, as the variants' leaps are one action", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { poise: 75, row: 1, title: "Driftcloud Wave DMG Lv.1" },
      { poise: 75, row: 2, title: "Driftcloud Wave DMG Lv.2" },
      { poise: 150, row: 3, title: "Driftcloud Wave DMG Lv.3" },
    ];

    expect(
      findHitPathRowsMap(
        [
          ["plungeVariants.0.hits.0", "Driftcloud Wave DMG"],
          ["plungeVariants.1.hits.0", "Driftcloud Wave DMG"],
          ["plungeVariants.2.hits.0", "Driftcloud Wave DMG"],
        ],
        properties,
      ),
    ).toStrictEqual(
      new Map([
        ["plungeVariants.0.hits.0", [properties[0]]],
        ["plungeVariants.1.hits.0", [properties[1]]],
        ["plungeVariants.2.hits.0", [properties[2]]],
      ]),
    );
  });

  test("gives each top-level list's hits sharing a label the rows numbered by their places, as each list is its action", () => {
    expect.hasAssertions();

    const properties: WikiAdvancedProperty[] = [
      { poise: 26.96, row: 1, title: "4-Hit DMG 1" },
      { poise: 10, row: 2, title: "4-Hit DMG 2" },
    ];

    expect(
      findHitPathRowsMap(
        [
          ["hits.fieryRainArrows.0", "4-Hit DMG"],
          ["hits.fieryRainArrows.1", "4-Hit DMG"],
          ["hits.everyArrowFindsItsTargetFieryRainArrows.0", "4-Hit DMG"],
          ["hits.everyArrowFindsItsTargetFieryRainArrows.1", "4-Hit DMG"],
        ],
        properties,
      ),
    ).toStrictEqual(
      new Map([
        ["hits.everyArrowFindsItsTargetFieryRainArrows.0", [properties[0]]],
        ["hits.everyArrowFindsItsTargetFieryRainArrows.1", [properties[1]]],
        ["hits.fieryRainArrows.0", [properties[0]]],
        ["hits.fieryRainArrows.1", [properties[1]]],
      ]),
    );
  });
});
