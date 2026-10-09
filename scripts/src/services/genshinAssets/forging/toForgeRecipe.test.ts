import type { ExcelForgeRow } from "#src/models/genshinAssets/forging/ExcelForgeRow";

import { toForgeRecipe } from "#src/services/genshinAssets/forging/toForgeRecipe";
import { ForgeRecipeKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toForgeRecipe, () => {
  const ENHANCEMENT_FORGE_TYPE = 1;
  const WIDGET_FORGE_TYPE = 8;
  const WEAPON_FORGE_TYPE = 3;
  const createRow = (overrides: Partial<ExcelForgeRow>): ExcelForgeRow => ({
    forgePoint: 400,
    forgeTime: 3,
    forgeType: ENHANCEMENT_FORGE_TYPE,
    id: 11_001,
    isDefaultShow: true,
    materialItems: [
      { count: 2, id: 101_001 },
      { count: 0, id: 0 },
    ],
    playerLevel: 2,
    queueNum: 40,
    resultItemCount: 1,
    resultItemId: 104_011,
    scoinCost: 5,
    ...overrides,
  });

  test("should write an enhancement ore with its forge points, seconds, Mora and queue size", () => {
    expect.hasAssertions();

    expect(toForgeRecipe(createRow({}), [])).toStrictEqual({
      forgePoint: 400,
      id: 11_001,
      kind: ForgeRecipeKind.Enhancement,
      materials: [{ count: 2, id: 101_001 }],
      mora: 5,
      playerLevel: 2,
      queueSize: 40,
      resultCount: 1,
      resultItemId: 104_011,
      seconds: 3,
      unlockItemIds: [],
    });
  });

  test("should write a four-star weapon from its billet, counting no forge points", () => {
    expect.hasAssertions();

    const weaponRow = createRow({
      forgePoint: 0,
      forgeTime: 10,
      forgeType: WEAPON_FORGE_TYPE,
      id: 13_001,
      materialItems: [
        { count: 1, id: 101_101 },
        { count: 50, id: 101_003 },
      ],
      queueNum: 1,
      resultItemId: 11_406,
      scoinCost: 500,
    });

    expect(toForgeRecipe(weaponRow, [221_003])).toStrictEqual({
      forgePoint: 0,
      id: 13_001,
      kind: ForgeRecipeKind.Weapon,
      materials: [
        { count: 1, id: 101_101 },
        { count: 50, id: 101_003 },
      ],
      mora: 500,
      playerLevel: 2,
      queueSize: 1,
      resultCount: 1,
      resultItemId: 11_406,
      seconds: 10,
      unlockItemIds: [221_003],
    });
  });

  test("should leave out the gadgets' widgets and a result a drop table draws", () => {
    expect.hasAssertions();

    expect(toForgeRecipe(createRow({ forgeType: WIDGET_FORGE_TYPE }), [])).toBeUndefined();
    expect(toForgeRecipe(createRow({ resultItemId: 0 }), [])).toBeUndefined();
  });

  test("should refuse a recipe hidden with no diagram to open it", () => {
    expect.hasAssertions();

    expect(() =>
      toForgeRecipe(createRow({ forgeType: WEAPON_FORGE_TYPE, isDefaultShow: false }), []),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 11001, is hidden with no diagram to open it]`,
    );
  });
});
