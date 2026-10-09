import type { ExcelCombineRow } from "#src/models/genshinAssets/crafting/ExcelCombineRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { COMBINE_RECIPE_TYPE, CONDENSED_RESIN_ITEM_ID } from "#src/services/genshinAssets/crafting/constants";
import { toCraftingRecipe } from "#src/services/genshinAssets/crafting/toCraftingRecipe";
import { CraftingRecipeKind } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toCraftingRecipe, () => {
  const TIER_COMBINE_TYPE = 1;
  const POTION_COMBINE_TYPE = 4;
  const UNLOCKED_COMBINE_ID = 22_033;
  const UNLOCK_ITEM_ID = 221_035;
  const RESULT_NAME_TEXT_HASH = 1;
  const createMaterial = (id: number): MaterialRow => ({
    foodQuality: "",
    id,
    itemUse: [],
    materialType: "",
    nameTextMapHash: RESULT_NAME_TEXT_HASH,
    rank: 0,
    rankLevel: 0,
    stackLimit: 0,
  });
  const materialMap = new Map([
    [22_033, createMaterial(22_033)],
    [112_003, createMaterial(112_003)],
    [CONDENSED_RESIN_ITEM_ID, createMaterial(CONDENSED_RESIN_ITEM_ID)],
  ]);
  const createRow = (overrides: Partial<ExcelCombineRow>): ExcelCombineRow => ({
    combineId: 11_002,
    combineType: TIER_COMBINE_TYPE,
    isDefaultShow: true,
    materialItems: [
      { count: 3, id: 112_002 },
      { count: 0, id: 0 },
    ],
    playerLevel: 5,
    recipeType: COMBINE_RECIPE_TYPE,
    resultItemCount: 1,
    resultItemId: 112_003,
    scoinCost: 50,
    ...overrides,
  });

  test("should write a tier as its three of one material, dropping the empty slots", () => {
    expect.hasAssertions();

    expect(toCraftingRecipe(createRow({}), { materialMap, unlockItemIds: [] })).toStrictEqual({
      id: 11_002,
      kind: CraftingRecipeKind.Tier,
      materials: [{ count: 3, id: 112_002 }],
      mora: 50,
      nameTextId: String(RESULT_NAME_TEXT_HASH),
      playerLevel: 5,
      resultCount: 1,
      resultItemId: 112_003,
      unlockItemIds: [],
    });
  });

  test("should refuse a tier that does not take three of one material", () => {
    expect.hasAssertions();

    const twoMaterialRow = createRow({
      materialItems: [
        { count: 1, id: 112_002 },
        { count: 2, id: 112_004 },
      ],
    });

    expect(() =>
      toCraftingRecipe(twoMaterialRow, { materialMap, unlockItemIds: [] }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 11002, is not three of a material for one]`,
    );
  });

  test("should write Condensed Resin by its result, whatever its combine type", () => {
    expect.hasAssertions();

    const condensedResinRow = createRow({
      combineType: 6,
      isDefaultShow: false,
      materialItems: [
        { count: 1, id: 100_085 },
        { count: 60, id: 106 },
      ],
      resultItemId: CONDENSED_RESIN_ITEM_ID,
      scoinCost: 100,
    });

    expect(toCraftingRecipe(condensedResinRow, { materialMap, unlockItemIds: [221_007] })).toStrictEqual({
      id: 11_002,
      kind: CraftingRecipeKind.CondensedResin,
      materials: [
        { count: 1, id: 100_085 },
        { count: 60, id: 106 },
      ],
      mora: 100,
      nameTextId: String(RESULT_NAME_TEXT_HASH),
      playerLevel: 5,
      resultCount: 1,
      resultItemId: CONDENSED_RESIN_ITEM_ID,
      unlockItemIds: [221_007],
    });
  });

  test("should refuse Condensed Resin without its crystal core", () => {
    expect.hasAssertions();

    const resinOnlyRow = createRow({ materialItems: [{ count: 60, id: 106 }], resultItemId: CONDENSED_RESIN_ITEM_ID });

    expect(() => toCraftingRecipe(resinOnlyRow, { materialMap, unlockItemIds: [] })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 11002, is not one crystal core and sixty Original Resin]`,
    );
  });

  test("should leave out a row that is not a bench craft", () => {
    expect.hasAssertions();

    expect(
      toCraftingRecipe(createRow({ recipeType: "RECIPE_TYPE_CONVERT" }), { materialMap, unlockItemIds: [] }),
    ).toBeUndefined();
    expect(toCraftingRecipe(createRow({ combineType: 9 }), { materialMap, unlockItemIds: [] })).toBeUndefined();
  });

  test("should write a hidden recipe only with an instruction to open it", () => {
    expect.hasAssertions();

    const hiddenPotionRow = createRow({
      combineId: UNLOCKED_COMBINE_ID,
      combineType: POTION_COMBINE_TYPE,
      isDefaultShow: false,
    });

    expect(() =>
      toCraftingRecipe(hiddenPotionRow, { materialMap, unlockItemIds: [] }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 22033, is hidden with no instruction to open it]`,
    );
    expect(
      toCraftingRecipe(hiddenPotionRow, { materialMap, unlockItemIds: [UNLOCK_ITEM_ID] })?.unlockItemIds,
    ).toStrictEqual([UNLOCK_ITEM_ID]);
  });
});
