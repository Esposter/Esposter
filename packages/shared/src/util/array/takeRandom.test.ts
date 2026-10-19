import { takeRandom } from "#src/util/array/takeRandom";
import { describe, expect, test } from "vitest";

describe(takeRandom, () => {
  test("picks the first entry at the bottom of the draw and the last just below its top", () => {
    expect.hasAssertions();
    expect(takeRandom(["a", "b"], () => 0)).toBe("a");
    expect(takeRandom(["a", "b"], () => 1 - Number.EPSILON)).toBe("b");
  });
});
