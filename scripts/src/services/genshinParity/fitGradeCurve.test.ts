import { applyGradeCurve } from "#src/services/genshinParity/applyGradeCurve";
import { fitGradeCurve } from "#src/services/genshinParity/fitGradeCurve";
import { describe, expect, test } from "vitest";

describe(fitGradeCurve, () => {
  test("follows a grade that lifts the shadows and keeps it monotone", () => {
    expect.hasAssertions();

    const samples = Array.from({ length: 101 }, (_, index) => ({ from: index / 100, to: Math.sqrt(index / 100) }));

    const { knots, residual } = fitGradeCurve(samples);

    expect(residual).toBeLessThan(0.02);
    expect(applyGradeCurve(knots, 0.25)).toBeCloseTo(0.5, 1);
    expect(knots.every((value, index) => index === 0 || value >= (knots[index - 1] ?? 0))).toBe(true);
  });
});
