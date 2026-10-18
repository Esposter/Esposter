import { toAbyssEnemyKinds } from "#src/services/genshinAssets/spiralAbyss/toAbyssEnemyKinds";
import { describe, expect, test } from "vitest";

describe(toAbyssEnemyKinds, () => {
  const DESCRIBE_ID = 1;
  const OTHER_DESCRIBE_ID = 2;
  const monsterRows = [
    { describeId: DESCRIBE_ID, id: 32 },
    { describeId: DESCRIBE_ID, id: 31 },
    { describeId: OTHER_DESCRIBE_ID, id: 41 },
  ];

  test("a describe is fought as its base variant, the monster of it with the lowest id", () => {
    expect.hasAssertions();

    expect(toAbyssEnemyKinds([DESCRIBE_ID, OTHER_DESCRIBE_ID], monsterRows)).toStrictEqual({
      [DESCRIBE_ID]: 31,
      [OTHER_DESCRIBE_ID]: 41,
    });
  });

  test("a describe with no monster row is left out, as the world has no kind to fight it as", () => {
    expect.hasAssertions();

    expect(toAbyssEnemyKinds([3], monsterRows)).toStrictEqual({});
  });
});
