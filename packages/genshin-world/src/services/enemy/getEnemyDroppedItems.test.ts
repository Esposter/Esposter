import { getEnemyDroppedItems } from "#src/services/enemy/getEnemyDroppedItems";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { describe, expect, test } from "vitest";

describe(getEnemyDroppedItems, () => {
  test("leaves the Mora as one pile and each material piece on its own", () => {
    expect.hasAssertions();

    expect(
      getEnemyDroppedItems({ characterExperience: 0, materials: [{ count: 2, itemId: 112_005 }], mora: 32 }),
    ).toStrictEqual([
      { count: 32, itemId: MORA_ITEM_ID },
      { count: 1, itemId: 112_005 },
      { count: 1, itemId: 112_005 },
    ]);
  });

  test("leaves no pile of Mora an enemy did not drop", () => {
    expect.hasAssertions();

    expect(
      getEnemyDroppedItems({ characterExperience: 0, materials: [{ count: 1, itemId: 112_005 }], mora: 0 }),
    ).toStrictEqual([{ count: 1, itemId: 112_005 }]);
  });
});
