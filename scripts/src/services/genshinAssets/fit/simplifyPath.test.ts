import { simplifyPath } from "#src/services/genshinAssets/fit/simplifyPath";
import { describe, expect, test } from "vitest";

describe(simplifyPath, () => {
  test("keeps a point straying past the tolerance in any of its dimensions", () => {
    expect.hasAssertions();

    // A straight run whose fourth coordinate, a radius, swells at its middle
    expect(
      simplifyPath(
        [
          [0, 0, 0, 1],
          [1, 0, 0, 1],
          [2, 0, 0, 2],
          [3, 0, 0, 1],
          [4, 0, 0, 1],
        ],
        0.5,
      ),
    ).toStrictEqual([
      [0, 0, 0, 1],
      [2, 0, 0, 2],
      [4, 0, 0, 1],
    ]);
  });
});
