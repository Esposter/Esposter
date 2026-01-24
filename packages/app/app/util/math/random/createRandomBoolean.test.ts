import { createRandomBoolean } from "@/util/math/random/createRandomBoolean";
import { describe, expect, test } from "vitest";

describe(createRandomBoolean, () => {
  test("creates", () => {
    expect.hasAssertions();

    expect(createRandomBoolean(0)).toBe(false);
    expect(createRandomBoolean(1)).toBe(true);
  });
});
