import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";

import { computeFriendshipLevel } from "#src/services/friendship/computeFriendshipLevel";
import { describe, expect, test } from "vitest";

describe(computeFriendshipLevel, () => {
  const FRIENDSHIP_LEVELS: FriendshipLevel[] = [
    { exp: 0, level: 1 },
    { exp: 10, level: 2 },
    { exp: 30, level: 3 },
  ];

  test("should read the level whose EXP is reached, and never past the top level", () => {
    expect.hasAssertions();

    expect(
      [0, 9, 10, 29, 30, 40].map((friendshipExp) => computeFriendshipLevel(friendshipExp, FRIENDSHIP_LEVELS)),
    ).toStrictEqual([1, 1, 2, 2, 3, 3]);
  });
});
