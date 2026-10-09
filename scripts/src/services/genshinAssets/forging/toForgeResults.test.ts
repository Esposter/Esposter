import type { ExcelForgeRandomRow } from "#src/models/genshinAssets/forging/ExcelForgeRandomRow";
import type { ExcelForgeRow } from "#src/models/genshinAssets/forging/ExcelForgeRow";

import { toForgeResults } from "#src/services/genshinAssets/forging/toForgeResults";
import { describe, expect, test } from "vitest";

const createRow = (overrides: Partial<ExcelForgeRow>): ExcelForgeRow => ({
  forgePoint: 0,
  forgeTime: 5,
  forgeType: 1,
  id: 12_001,
  isDefaultShow: true,
  mainRandomDropId: 0,
  materialItems: [{ count: 3, id: 101_004 }],
  playerLevel: 30,
  queueNum: 1,
  resultItemCount: 6,
  resultItemId: 0,
  scoinCost: 100,
  ...overrides,
});
describe(toForgeResults, () => {
  const MYSTIC_DROP_ID = 208_001_500;
  const MYSTIC_RANDOM_ID = 20_001;
  const ORE_ID = 104_013;
  const randomRows: ExcelForgeRandomRow[] = [
    { forgeRandomId: 10_001, mainRandomItems: [{ count: 1, itemId: 11_403, weight: 500 }] },
    { forgeRandomId: MYSTIC_RANDOM_ID, mainRandomItems: [{ count: 6, itemId: ORE_ID, weight: 10_000 }, {}] },
  ];

  test("should yield a row's fixed result as its only result", () => {
    expect.hasAssertions();

    expect(toForgeResults(createRow({ resultItemId: ORE_ID, resultItemCount: 1 }), randomRows)).toStrictEqual([
      { count: 1, itemId: ORE_ID, weight: 1 },
    ]);
  });

  test("should draw a row with no fixed result from the random table its drop id names, leaving out the empty slots", () => {
    expect.hasAssertions();

    expect(toForgeResults(createRow({ mainRandomDropId: MYSTIC_DROP_ID }), randomRows)).toStrictEqual([
      { count: 6, itemId: ORE_ID, weight: 10_000 },
    ]);
  });

  test("should refuse a drop id naming no random table", () => {
    expect.hasAssertions();

    expect(() => toForgeResults(createRow({ mainRandomDropId: 1 }), randomRows)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 12001, draws from a drop id with no random table]`,
    );
  });
});
