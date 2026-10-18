import { computeZeta } from "#src/services/function/computeZeta";
import { describe, expect, test } from "vitest";

describe(computeZeta, () => {
  test("A negative zeta past the gamma's overflow is finite", () => {
    expect.hasAssertions();

    expect(Number.isFinite(computeZeta(-200.5))).toBe(true);
    expect(computeZeta(-200.5)).toBeLessThan(0);
  });
});
