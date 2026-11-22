import { getRandomValue } from "#src/util/math/random/getRandomValue";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(getRandomValue, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("picks the value at the random index", () => {
    expect.hasAssertions();

    vi.spyOn(Math, "random").mockReturnValue(0.99);

    expect(getRandomValue(["a", "b"])).toBe("b");
  });

  test("fails for empty values", () => {
    expect.hasAssertions();

    expect(() => getRandomValue([])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getRandomValue, cannot pick random value from empty values]`,
    );
  });
});
