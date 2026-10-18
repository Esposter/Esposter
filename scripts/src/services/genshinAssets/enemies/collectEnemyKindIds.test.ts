import { describe, expect, test } from "vitest";

import { collectEnemyKindIds } from "#src/services/genshinAssets/enemies/collectEnemyKindIds";

describe("collectEnemyKindIds", () => {
  test("every kind a camp places is published to the enemies dataset", () => {
    expect.hasAssertions();
    const kindIds = collectEnemyKindIds([
      { enemyCamps: [{ members: [{ enemyKindId: 21010401 }, { enemyKindId: 21010101 }] }] },
      { enemyCamps: [{ members: [{ enemyKindId: 21010101 }] }, { members: [{ enemyKindId: 26010101 }] }] },
    ]);
    expect(kindIds).toStrictEqual([21010101, 21010401, 26010101]);
  });
});
