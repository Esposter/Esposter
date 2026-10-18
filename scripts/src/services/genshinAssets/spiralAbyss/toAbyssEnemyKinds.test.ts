import { toAbyssEnemyKinds } from "#src/services/genshinAssets/spiralAbyss/toAbyssEnemyKinds";
import { describe, expect, test } from "vitest";

describe(toAbyssEnemyKinds, () => {
  const DESCRIBE_ID = 1;
  const OTHER_DESCRIBE_ID = 2;
  const PLACED_ENEMY_KIND_ID = 32;
  const monsterRows = [
    { describeId: DESCRIBE_ID, id: 31 },
    { describeId: DESCRIBE_ID, id: PLACED_ENEMY_KIND_ID },
    { describeId: OTHER_DESCRIBE_ID, id: 41 },
  ];

  test("a describe is fought as the one monster of it that the regions place", () => {
    expect.hasAssertions();

    expect(toAbyssEnemyKinds([DESCRIBE_ID, OTHER_DESCRIBE_ID], monsterRows, [PLACED_ENEMY_KIND_ID])).toStrictEqual({
      [DESCRIBE_ID]: PLACED_ENEMY_KIND_ID,
    });
  });

  test("a describe none of whose monsters the regions place is left out", () => {
    expect.hasAssertions();

    expect(toAbyssEnemyKinds([OTHER_DESCRIBE_ID], monsterRows, [PLACED_ENEMY_KIND_ID])).toStrictEqual({});
  });

  test("a describe with two monsters the regions place is refused", () => {
    expect.hasAssertions();

    expect(() =>
      toAbyssEnemyKinds([DESCRIBE_ID], monsterRows, [31, PLACED_ENEMY_KIND_ID]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 1, is placed as 2 kinds]`,
    );
  });
});
