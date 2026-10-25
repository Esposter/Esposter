import { createRandomBoolean } from "@/util/math/random/createRandomBoolean";
import { describe, expect, test } from "vitest";

describe(createRandomBoolean, () => {
  test("is never true at probability 0 and always true at 1", () => {
    expect.hasAssertions();

    expect(createRandomBoolean(0)).toBe(false);
    expect(createRandomBoolean(1)).toBe(true);
  });
});
