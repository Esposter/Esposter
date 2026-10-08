import type { ExcelFurnitureMakeRow } from "#src/models/genshinAssets/home/ExcelFurnitureMakeRow";

import { toHomeBlueprint } from "#src/services/genshinAssets/home/toHomeBlueprint";
import { describe, expect, test } from "vitest";

describe(toHomeBlueprint, () => {
  const FURNISHING_ID = 360_101;
  const DIAGRAM_ITEM_ID = 380_101;
  const createRow = (overrides: Partial<ExcelFurnitureMakeRow>): ExcelFurnitureMakeRow => ({
    count: 1,
    exp: 60,
    furnitureItemID: FURNISHING_ID,
    makeTime: 50_400,
    materialItems: [
      { count: 8, id: 101_307 },
      { count: 0, id: 0 },
    ],
    ...overrides,
  });

  test("should write the furnishing it makes with its materials, seconds and Trust EXP, leaving empty slots out", () => {
    expect.hasAssertions();

    expect(toHomeBlueprint(createRow({}), [DIAGRAM_ITEM_ID])).toStrictEqual({
      id: FURNISHING_ID,
      materials: [{ count: 8, id: 101_307 }],
      seconds: 50_400,
      trustExp: 60,
      unlockItemIds: [DIAGRAM_ITEM_ID],
    });
  });

  test("should refuse a row that makes more than one furnishing an order", () => {
    expect.hasAssertions();

    expect(() => toHomeBlueprint(createRow({ count: 2 }), [])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 360101, makes more than one]`,
    );
  });
});
