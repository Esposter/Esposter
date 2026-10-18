import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitRecord } from "genshin-world";

import { getMismatchedKitPaths } from "#src/services/genshinAssets/kits/record/getMismatchedKitPaths";
import { describe, expect, test } from "vitest";

const TALENT_MULTIPLIER_MAP: KitTables["talentMultiplierMap"] = {
  // Its parameters zero and one read 10 at every level alike, so a reference to either is the same value
  "1": [
    { level: 1, paramList: [10, 10] },
    { level: 2, paramList: [10, 10] },
  ],
  // Its parameter zero reads 1 at level one and 2 at level two, and its parameter one 3 at both
  "2": [
    { level: 1, paramList: [1, 3] },
    { level: 2, paramList: [2, 3] },
  ],
};

describe(getMismatchedKitPaths, () => {
  test("gives no path where a reference and its built value read the same at every level", () => {
    expect.hasAssertions();

    const builtRecord = { hits: [{ multiplier: { index: 0, proudSkillGroupId: 1 } }] } as unknown as KitRecord;
    const publishedRecord = { hits: [{ multiplier: { index: 1, proudSkillGroupId: 1 } }] } as unknown as KitRecord;

    expect(getMismatchedKitPaths(builtRecord, publishedRecord, TALENT_MULTIPLIER_MAP)).toStrictEqual([]);
  });

  test("gives each path where a value differs at a level, or is held by one record alone", () => {
    expect.hasAssertions();

    const builtRecord = {
      hits: [{ multiplier: { index: 0, proudSkillGroupId: 2 } }, { multiplier: 5 }],
    } as unknown as KitRecord;
    const publishedRecord = {
      hits: [{ multiplier: { index: 1, proudSkillGroupId: 2 } }, { multiplier: 5 }, { multiplier: 7 }],
    } as unknown as KitRecord;

    expect(getMismatchedKitPaths(builtRecord, publishedRecord, TALENT_MULTIPLIER_MAP)).toStrictEqual([
      "hits.length",
      "hits.0.multiplier",
      "hits.2.multiplier",
    ]);
  });
});
