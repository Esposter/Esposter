import { collectEnemyKindIds } from "#src/services/genshinAssets/enemies/collectEnemyKindIds";
import { describe, expect, test } from "vitest";

describe("collectEnemyKindIds", () => {
  test("every kind a camp places is published to the enemies dataset", () => {
    expect.hasAssertions();
    const kindIds = collectEnemyKindIds(
      [
        { enemyCamps: [{ members: [{ enemyKindId: 21010401 }, { enemyKindId: 21010101 }] }] },
        { enemyCamps: [{ members: [{ enemyKindId: 21010101 }] }, { members: [{ enemyKindId: 26010101 }] }] },
      ],
      [],
    );
    expect(kindIds).toStrictEqual([21010101, 21010401, 26010101]);
  });

  test("every kind a bounty hunts is published once, beside the camps' kinds", () => {
    expect.hasAssertions();
    const kindIds = collectEnemyKindIds(
      [{ enemyCamps: [{ members: [{ enemyKindId: 21010101 }] }] }],
      [22010101, 21010101],
    );
    expect(kindIds).toStrictEqual([21010101, 22010101]);
  });
});
