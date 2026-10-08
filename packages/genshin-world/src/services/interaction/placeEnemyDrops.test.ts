import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";

import { placeEnemyDrops } from "#src/services/interaction/placeEnemyDrops";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { describe, expect, test } from "vitest";

describe(placeEnemyDrops, () => {
  const enemy = { campId: "camp", id: "enemy", position: { x: 1, z: 2 } };

  test("lays the Mora as one pile and each material piece as a drop of its own, numbered from the page's count", () => {
    expect.hasAssertions();

    const enemyDrops: EnemyDrops = {
      characterExperience: 0,
      materials: [
        { count: 1, itemId: 112_005 },
        { count: 1, itemId: 112_006 },
      ],
      mora: 32,
    };

    expect(placeEnemyDrops(enemy, enemyDrops, 0)).toStrictEqual([
      { count: 32, id: "camp|enemy|0", itemId: MORA_ITEM_ID, position: { x: 1, z: 2 } },
      { count: 1, id: "camp|enemy|1", itemId: 112_005, position: { x: 1, z: 2 } },
      { count: 1, id: "camp|enemy|2", itemId: 112_006, position: { x: 1, z: 2 } },
    ]);
  });

  test("lays no pile of Mora an enemy did not drop", () => {
    expect.hasAssertions();

    const enemyDrops: EnemyDrops = { characterExperience: 0, materials: [{ count: 1, itemId: 112_005 }], mora: 0 };

    expect(placeEnemyDrops(enemy, enemyDrops, 3)).toStrictEqual([
      { count: 1, id: "camp|enemy|3", itemId: 112_005, position: { x: 1, z: 2 } },
    ]);
  });
});
