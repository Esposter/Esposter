import { mod } from "@/util/math/mod";
import { describe, expect, test } from "vitest";

describe(mod, () => {
  test("wraps a negative dividend into the divisor's range", () => {
    expect.hasAssertions();

    expect(mod(1, 2)).toBe(1);
    expect(mod(-1, 2)).toBe(1);
  });
});
