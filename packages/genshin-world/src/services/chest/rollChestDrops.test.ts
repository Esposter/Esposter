import { ChestKind } from "#src/models/chest/ChestKind";
import { rollChestDrops } from "#src/services/chest/rollChestDrops";
import { describe, expect, test } from "vitest";

describe(rollChestDrops, () => {
  test("pours one weapon of its pool and each material's count, a material rolling none left out", () => {
    expect.hasAssertions();

    expect(rollChestDrops(ChestKind.Common, () => 0)).toStrictEqual([
      { count: 1, itemId: 11_101 },
      { count: 4, itemId: 104_001 },
      { count: 1, itemId: 104_002 },
    ]);
    expect(rollChestDrops(ChestKind.Common, () => 0.999)).toStrictEqual([
      { count: 1, itemId: 15_305 },
      { count: 4, itemId: 104_001 },
      { count: 3, itemId: 104_002 },
      { count: 2, itemId: 104_003 },
    ]);
  });

  test("pours no weapon from a tier whose pool names none", () => {
    expect.hasAssertions();

    expect(rollChestDrops(ChestKind.Precious, () => 0.999)).toStrictEqual([
      { count: 1, itemId: 104_002 },
      { count: 1, itemId: 104_003 },
    ]);
  });

  test("pours nothing from a kind with no pool", () => {
    expect.hasAssertions();

    expect(rollChestDrops(ChestKind.Luxurious, () => 0.999)).toStrictEqual([]);
  });
});
